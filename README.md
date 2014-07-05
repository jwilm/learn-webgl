learn-webgl
===========

This is a framework for solving the lessons on http://learningwebgl.com/ and
solutions to those problems. I am in no way affiliated the afforementioned
website. The solutions can be viewed by checking out the appropriate `tag`. The
solutions are a work in progress.

## Framework
Everything you need to get started is in `app/`. The `js` folder contains all of
the javascript. Most importantly, the file you should be working with is
`main.js`. If you need to include other javascript files, you may need to extend
the `concat` file list in the included `Gruntfile.js`. Shaders are kept in
`app/shaders/` and are organized by shader type. The `compile:shaders` task uses
the shader path to determine shader type. Shaders are then exposed in the
javascript under the `shaders` variable.

The [glMatrix](http://glmatrix.net/docs/2.2.0/index.html) library is included in
and is accessible in `main.js`.

To get started `npm install` to fetch dependencies, and run `grunt` in your
project directory to lint and keep things compiled. Point your browser to
`index.html` and start hacking!

