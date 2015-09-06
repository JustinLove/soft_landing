var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.soft_landing/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    clean: ['pa'],
    // copy files from PA, transform, and put into mod
    proc: {
      // form 1: just the relative path, media src is assumed
      landing: {
        targets: [
          'pa/effects/specs/default_commander_landing.pfx'
        ],
        process: function(spec) {
          spec.emitters = spec.emitters.filter(function(emit) {
            // white shell
            return emit.spec.papa != '/pa/effects/fbx/particles/sphere_ico16seg.papa'
          })
          spec.emitters.forEach(function(emit) {
            if (emit.spec.shader == 'meshParticle_clip_smoke_bend') {
              // smoke shell
              emit.alpha = 0.5
            } else if (emit.spec.baseTexture == '/pa/effects/textures/particles/softSmoke.papa' && emit.type == 'Cylinder_Z') {
              // large expanding dust
              emit.alpha[0][1] = 0.15
            } else if (emit.spec.shape == 'pointlight') {
              // bright blusih glow
              emit.alpha = 0.05
            }
          })
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc']);

};

