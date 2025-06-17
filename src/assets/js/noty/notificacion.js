var mojsOpenExample = function (promise) {
    var n = this
    var Timeline = new mojs.Timeline()
    var body = new mojs.Html({
      el: n.barDom,
      x: {500: 0, delay: 0, duration: 500, easing: 'elastic.out'},
      isForce3d: true,
      onComplete: function () {
        promise(function(resolve) {
          resolve()
        })
      }
    })

    var parent = new mojs.Shape({
      parent: n.barDom,
      width: 200,
      height: n.barDom.getBoundingClientRect().height,
      radius: 0,
      x: {[150]: -150},
      duration: 1.2 * 500,
      isShowStart: true
    })

    n.barDom.style['overflow'] = 'visible'
    parent.el.style['overflow'] = 'hidden'

    var burst = new mojs.Burst({
      parent: parent.el,
      count: 10,
      top: n.barDom.getBoundingClientRect().height + 75,
      degree: 90,
      radius: 75,
      angle: {[-90]: 40},
      children: {
        fill: '#EBD761',
        delay: 'stagger(500, -50)',
        radius: 'rand(8, 25)',
        direction: -1,
        isSwirl: true
      }
    })

    const fadeBurst = new mojs.Burst({
      parent: parent.el,
      count: 2,
      degree: 0,
      angle: 75,
      radius: {0: 100},
      top: '90%',
      children: {
        fill: '#EBD761',
        pathScale: [.65, 1],
        radius: 'rand(12, 15)',
        direction: [-1, 1],
        delay: .8 * 500,
        isSwirl: true
      }
    })

    Timeline.add(body, burst, fadeBurst, parent)
    Timeline.play()
  }

  var mojsCloseExample = function (promise) {
    var n = this
    new mojs.Html({
      el: n.barDom,
      x: {0: 500, delay: 0, duration: 250, easing: 'cubic.out'},
      opacity: {1: 0, delay: 0, duration: 250},
      isForce3d: true,
      onComplete: function () {
        promise(function(resolve) {
          resolve()
        })
      }
    }).play()
  }

  var bouncejsOpenExample = function () {
    var n = this
    new Bounce()
      .translate({
        from: {x: 450, y: 0},
        to: {x: 0, y: 0},
        easing: 'bounce',
        duration: 1000,
        bounces: 4,
        stiffness: 3
      })
      .scale({
        from: {x: 1.2, y: 1},
        to: {x: 1, y: 1},
        easing: 'bounce',
        duration: 1000,
        delay: 100,
        bounces: 4,
        stiffness: 1
      })
      .scale({
        from: {x: 1, y: 1.2},
        to: {x: 1, y: 1},
        easing: 'bounce',
        duration: 1000,
        delay: 100,
        bounces: 6,
        stiffness: 1
      })
      .applyTo(n.barDom, {
        onComplete: function () {
          n.resume()
        }
      })
  }

  var bouncejsCloseExample = function () {
    var n = this
    new Bounce()
      .translate({
        from: {x: 0, y: 0},
        to: {x: 450, y: 0},
        easing: 'bounce',
        duration: 500,
        bounces: 4,
        stiffness: 1
      })
      .applyTo(n.barDom, {
        onComplete: function () {
          n.barDom.parentNode.removeChild(n.barDom)
        }
      })
  }

  var velocityShowExample = function () {
    var n = this

    Velocity(n.barDom, {
      left: 450,
      scaleY: 2
    }, {
      duration: 0
    })
    Velocity(n.barDom, {
      left: 0,
      scaleY: 1
    }, {
      easing: [8, 8]
    })
  }

  var velocityCloseExample = function () {
    var n = this

    Velocity(n.barDom, {
      left: '+=-50'
    }, {
      easing: [8, 8, 2],
      duration: 350
    })
    Velocity(n.barDom, {
      left: 450,
      scaleY: .2,
      height: 0,
      margin: 0
    }, {
      easing: [8, 8],
      complete: function () {
        n.barDom.parentNode.removeChild(n.barDom)
      }
    })
  }

  var notes = []
  notes['alert'] = 'Best check yo self, you\'re not looking too good.'
  notes['error'] = 'Change a few things up and try submitting again.'
  notes['success'] = 'You successfully read this important alert message.'
  notes['information'] = 'This alert needs your attention, but it\'s not super important.'
  notes['warning'] = '<strong>Warning!</strong> <br /> Best check yo self, you\'re not looking too good.'

  document.querySelector('.runner').addEventListener('click', function (e) {
    e.preventDefault()

    var layout = document.querySelector('select#layout')
    var type = document.querySelector('select#type')

    layout = layout.options[layout.selectedIndex].text
    type = type.options[type.selectedIndex].text

    var types = ['alert', 'error', 'success', 'information', 'warning']
    if (type === 'random')
      type = types[Math.floor(Math.random() * types.length)]

    if (layout === 'inline') {
      new Noty({
        text: notes[type],
        type: type,
        timeout: 5000,
        container: '#custom_container'
      }).show()
      return false
    }

    new Noty({
      text: notes[type],
      type: type,
      timeout: 5000,
      layout: layout
    }).show()

    

    return false
  })

  function Notificacion(tipo,titulo) {
      new Noty({
      text:`${titulo}`,
      type: `${tipo}`,
      timeout: 4000,
      layout: "topRight",
      container: '#custom_container'
    }).show()
  }
  function Notificacion2(tipo,titulo) {
    new Noty({
    text:`${titulo}`,
    type: `${tipo}`,
    timeout: 4000,
    layout: "topRight"
  }).show()
}

  function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  var notification_alert = '<div class="activity-item"> <i class="fa fa-tasks text-warning"></i> <div class="activity"> There are <a href="/">6 new tasks</a> waiting for you. Don\'t forget! <span>3 hours ago</span> </div> </div>',
    notification_info = '<div class="activity-item"> <i class="fa fa-check text-success"></i> <div class="activity"> Mail server was updated. See <a href="#">changelog</a> <span>2 hours ago</span> </div> </div>',
    notification_success = '<div class="activity-item"> <i class="fa fa-heart text-danger"></i> <div class="activity"> Your <a href="#">latest post</a> was liked by <a href="#"></a> <span>35 minutes ago</span> </div> </div>',
    notification_warning = '<div class="activity-item"> <i class="fa fa-shopping-cart text-success"></i> <div class="activity"> <a href="#">Jane</a> ordered 2 copies of <a href="#">OEM license</a> <span>14 minutes ago</span> </div> </div>',
    notification_error = '<div class="activity-item"> <i class="fa fa-times-circle text-danger"></i> <div class="activity"> Opps! something bad happend! <span>14 minutes ago</span> </div> </div>'

  Noty.setMaxVisible(5) // global queue's max visible amount (default is 5)
  Noty.setMaxVisible(5, 'bottomRight')

  

