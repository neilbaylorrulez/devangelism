var st = require('st')
  , http = require('http')
  , gsheets = require('google-sheets')
  , nodeGeocoder = require('node-geocoder')
  , response = require('response')
  , request = require('request')
  , ical = require('ical-generator')

  , password = process.argv[process.argv.length -2]
  , sid = '1r86pdRjVAoMlJmXM1QRX5NwY2LerCwV7erG9xi4r28U'
  , port = process.env.PORT || 8000
  , stOptions =
    { path: process.cwd()
    , index: 'index.html'
    , url: '/'
    , dot: false
    , gzip: true
    , cache: false
    }
  , mount = st(stOptions)
  , queue = []
  , alldata
  , geoOpts =
    { apiKey: process.argv[process.argv.length -1]
    , formatter: null
    }
  , geocoder = nodeGeocoder.getGeocoder('google', 'https', geoOpts)
  ;

http.createServer(function (req, res) {
  if (req.url === '/spreadsheet.json') {
    getData(function (err, data) {
      if (err) return response.error(err)
      response.json(data).pipe(res)
    })
    return
  }
  if (req.url === '/spreadsheet.ical') {
    getCalendar(function (err, cal) {
      if (err) return response.error(err)
      cal.serve(res)
    })
    return
  }

  mount(req, res)

}).listen(port, function (e) {
  request('http://localhost:'+port+'/spreadsheet.ical', {json:true}, function (e, resp, data) {
    console.log(data)
  })
})

function getCalendar (cb) {
  getData(function (err, data) {
    if (err) return cb(err)
    var cal = ical()
    cal.setDomain('digitalocean.com').setName('Evangelism Calendar')
    data.forEach(function (ev) {
      if (!ev.startdate) return console.log('no startdate for', ev.eventname)
      var summary = ""
      if (ev.speaking) summary += 'Speaking: '+ev.speaking.join(', ')
      if (ev.attending) summary += 'Attending: '+ev.attending.join(', ')
      if (!summary.length) summary += 'DigitalOcean is sponsoring.'
      cal.addEvent(
        { start: ev.startdate
        , end: ev.enddate
        , summary: ev.eventname
        , description: summary
        , location: ev.location
        , allDay: true
        }
      )
    })
    cb(null, cal)
  })
}

function getData (cb) {
  if (alldata) {
    cb(null, alldata)
  } else {
    queue.push(cb)
  }
}

function flush () {
  while (queue.length) {
    queue.shift()(null, alldata)
  }
}

var geocache = {}

function geocode (d, cb) {
  if (d.location) {
    if (geocache[d.location]) {
      d.latlon = geocache[d.location]
      cb(null, geocache[d.location])
      return
    } else {
      geocoder.geocode(d.location, function(err, res) {
        geocache[d.location] = res
        d.latlon = geocache[d.location]
        cb(null, geocache[d.location])
        return
      })
    }
  } else {
    cb(null)
  }
}

function series (arr, fn, cb) {
  var i = 0
  function _do () {
    fn(arr[i], function () {
      i += 1
      if (i === arr.length) cb()
      else _do()
    })
  }
  _do()
}

function getDate (month, dayString, year) {
  var day = dayString.replace(/\D/g,'')
  if (isNaN(parseInt(day))) {
    return null
  } else {
    return new Date([month, day, year, 'UTC'].join(' '))
  }
}

function resolveName (str) {
  if (str.toLowerCase().indexOf('mikeal') !== -1) return 'Mikeal Rogers'
  if (str.toLowerCase().indexOf('john') !== -1) return 'John Edgar'
  if (str.toLowerCase().indexOf('erika') !== -1) return 'Erika Heidi'
  if (str.toLowerCase().indexOf('kaushal') !== -1) return 'Kaushal Parikh'
  if (str[str.length -1] === ' ') str = str.slice(0, str.length -1)
  return str
}

function clean (data) {
  delete data.sponsorship
  delete data.promocode
  delete data.productionneeds
  delete data.ofattendees
  delete data.keyhighlights
  delete data.cpa
  delete data.registeredusers

  if (data.days) {
    var s = data.month.split('\n')
      , month = s[0].replace(/\ /g, '')
      , year = s[1].replace(/\ /g, '')
      ;
    if (data.days.indexOf('-') !== -1) {
      var days = data.days.split('-')
      data.startdate = getDate(month, days[0], year)
      data.enddate = getDate(month, days[1], year)
    } else {
      data.startdate = getDate(month, data.days, year)
      data.enddate = getDate(month, data.days, year)
    }
  }

  if (data.whoisspeaking) {
    var speaking = data.whoisspeaking.split(',')
                   .map(resolveName)
                   .filter(function (s) {return s.replace(/\n/g, '')})
    if (speaking.length) data.speaking = speaking
  }
  if (data.employeesattending) {
    var attending = data.employeesattending.split(',')
                    .map(resolveName)
                    .filter(function (s) {return s.replace(/\n/g, '')})
    if (attending.length) data.attending = attending
  }
  return data
}

function getSpreadsheet () {
  gsheets.auth(
    { email: 'mikeal@digitalocean.com'
    , password: password
    },
    function(err) {
      if (err) return console.error(err)
      gsheets.getSpreadsheet(sid, function(err, sheet) {
        if (err) return console.error(err)
        sheet.getWorksheets(function(err, worksheets) {
          if (err) return console.error(err)
          var _rows = []
            , _gr = 0
            ;
          // loop over the worksheets and print their titles
          worksheets.forEach(function (worksheet) {
            var title = worksheet.getTitle()

            function _handleAllRows () {
              var month
                , sheetdata = []
                , rows = _rows
                ;
              rows.forEach(function (row) {
                var data = row.data
                if (data.days) sheetdata.push(clean(data))
              })
              series(sheetdata, geocode, function () {
                alldata = sheetdata
                flush()
              })
            }

            function _getRowsCb (err, rows) {
              if (err) return console.error(err)

              rows.forEach(function (row) {
                var data = row.data
                if (!data.month) data.month = month
                else month = data.month
              })

              _rows = _rows.concat(rows.rows)
              _gr += 1
              if (_gr === 2) _handleAllRows()
            }

            if (title === 'Past Events' || title === 'Future Events') {
              worksheet.getRows(_getRowsCb)
            }
          })
        })
      })
    }
  )
}

getSpreadsheet()
setInterval(getSpreadsheet, 1000 * 60 * 10)
