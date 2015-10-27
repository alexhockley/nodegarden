'use strict';

(function () {
  'use strict';

  var pixelRatio = window.devicePixelRatio;
  var wWidth;
  var wHeight;
  var wArea;

  var nodes = new Array(Math.sqrt(wArea) / 10 | 0);

  var canvas = document.createElement('canvas');
  var ctx = canvas.getContext('2d');

  var $container = document.getElementById('container');

  if (pixelRatio !== 1) {
    // if retina screen, scale canvas
    canvas.style.transform = 'scale(' + 1 / pixelRatio + ')';
    canvas.style.transformOrigin = '0 0';
  }
  canvas.id = 'nodegarden';

  $container.appendChild(canvas);

  init();
  render();

  //add event listeners to the page
  window.addEventListener('resize', init);
  window.addEventListener("mousedown",function(event){
    addRemove(event);
  });


  function init() {
    wWidth = window.innerWidth * pixelRatio;
    wHeight = window.innerHeight * pixelRatio;
    wArea = wWidth * wHeight;

    // calculate nodes needed
    nodes.length = 1 | 0;

    // set canvas size
    canvas.width = wWidth;
    canvas.height = wHeight;

    // create nodes
    var i, len;
    for (i = 0, len = nodes.length; i < len; i++) {
      if (nodes[i]) {
        continue;
      }
      nodes[i] = {
        x: Math.random() * wWidth,
        y: Math.random() * wHeight,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5,
        m: Math.random() * 1.5 + 1,
        link: null,
        pos: false
      };
    }
  }

  //Function to determine whether or not to add or remove a node based on js event click
  function addRemove(event)
  {

    //left click
    if(event.button == 0)
    {
      //get the new last index and increase the size of the array
      var oldLen = nodes.length;
      nodes.length++;

      //create a new random sized node at the mouse pointer
      nodes[oldLen] = {
        x: event.layerX,
        y: event.layerY,
        vx: Math.random() * 1 - 0.5,
        vy: Math.random() * 1 - 0.5,
        m: Math.random() * 1.5 + 1,
        link: null,
        pos: false
      };

    }

    //middle click
    if(event.button == 1)
    {

      //get the click location
      var locX = event.layerX;
      var locY = event.layerY;

      //get the old length of the node array
      var oldLen = nodes.length;

      //create a new array which is one smaller
      var newNodes = new Array(oldLen-1);

      //initialize the index to remove as an invalid one
      var toRemove = -1;

      //initialize the closest distance to be 100000 units, which is way too big to be on the screen
      var closest = 100000;

      //find the closest one to cursor and rebuild the node list with one less
      for(var i = 0; i < nodes.length; i++)
      {
        //calculate distance from click using pythagorean theorem
        var dist = Math.sqrt(Math.pow(nodes[i].x-locX,2) + Math.pow(nodes[i].y-locY,2));

        //if closer, this is new closest, and save the array index
        if(dist < closest)
        {
          toRemove = i;
          closest = dist;
        }
      }

      //manually copy the node array with the closest node removed
      for(var i = 0, j=0; i < nodes.length; i++)
      {
        if(i !== toRemove)
        {
          newNodes[j] = nodes[i];
          j++;
        }
      }
      nodes = newNodes;
    }
  }

  function render() {
    var distance;
    var direction;
    var force;
    var xForce, yForce;
    var xDistance, yDistance;
    var i, j, nodeA, nodeB, len;

    // request new animationFrame
    requestAnimationFrame(render);

    // clear canvas
    ctx.clearRect(0, 0, wWidth, wHeight);

    // update links
    for (i = 0, len = nodes.length - 1; i < len; i++) {
      for (j = i + 1; j < len + 1; j++) {
        nodeA = nodes[i];
        nodeB = nodes[j];
        xDistance = nodeB.x - nodeA.x;
        yDistance = nodeB.y - nodeA.y;

        // calculate distance
        distance = Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));

        if (distance < nodeA.m / 2 + nodeB.m / 2) {
          // collision: remove smaller or equal
          if (nodeA.m <= nodeB.m) {
            nodeA.x = Math.random() * wWidth;
            nodeA.y = Math.random() * wHeight;
            nodeA.vx = Math.random() * 1 - 0.5;
            nodeA.vy = Math.random() * 1 - 0.5;
            nodeA.m = Math.random() * 1.5 + 1;
          }

          if (nodeB.m <= nodeA.m) {
            nodeB.x = Math.random() * wWidth;
            nodeB.y = Math.random() * wHeight;
            nodeB.vx = Math.random() * 1 - 0.5;
            nodeB.vy = Math.random() * 1 - 0.5;
            nodeB.m = Math.random() * 1.5 + 1;
          }
          continue;
        }

        if (distance > 200) {
          // distance over 200 pixels - ignore gravity
          continue;
        }

        // calculate gravity direction
        direction = {
          x: xDistance / distance,
          y: yDistance / distance
        };

        // calculate gravity force
        force = 10 * nodeA.m * nodeB.m / Math.pow(distance, 2);

        if (force > 0.025) {
          // cap force to a maximum value of 0.025
          force = 0.025;
        }


        // draw gravity lines
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(67,67,67,'+ force * 50 + ')';
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);
        ctx.stroke();

        xForce = force * direction.x;
        yForce = force * direction.y;

        // calculate new velocity after gravity
        if (nodeA.pos !== nodeB.pos) {
          nodeA.vx -= xForce;
          nodeA.vy -= yForce;

          nodeB.vx += xForce;
          nodeB.vy += yForce;
        } else {
          nodeA.vx += xForce;
          nodeA.vy += yForce;

          nodeB.vx -= xForce;
          nodeB.vy -= yForce;
        }
      }
    }
    // update nodes
    for (i = 0, len = nodes.length; i < len; i++) {
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, nodes[i].m, 0, 2 * Math.PI);
      ctx.fill();

      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;

      if (nodes[i].x > wWidth + 25 || nodes[i].x < -25 || nodes[i].y > wHeight + 25 || nodes[i].y < -25) {
        // if node over screen limits - reset to a init position
        nodes[i].x = Math.random() * wWidth;
        nodes[i].y = Math.random() * wHeight;
        nodes[i].vx = Math.random() * 1 - 0.5;
        nodes[i].vy = Math.random() * 1 - 0.5;
      }
    }
  }
})();
