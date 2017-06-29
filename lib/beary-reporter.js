var Robot = require('./beary-chat-bot.js');

class reporter {
  constructor(options) {
    this.options = options
  }
  reporter(results, done) {
    this.write(results, options, done)
  }
  write(results, options, done) {

    if(typeof options === 'function'){
      done = options
    }
    options = this.options
    var webHookUrl = options.webHookUrl
      , sendOnlyOnFailure = options.sendOnFailure || false
      , sendOnlyFailedTests = options.sendOnlyFailedTests || false
      , modules = results.modules || {}
      , attachments = []
      , message, robot, completed, skipped, color
    ;
    if (!webHookUrl) {
      console.warn('[beary-reporter] beary-chat Webhook URL is not configured.');
      return done();
    }
    robot = new Robot(webHookUrl);

    if(sendOnlyOnFailure && results.failed < 1){
      return done();
    }

    message = options.message || {};
    if (typeof message === 'function') {
      message = message.apply(this, [results, options]);
    }
    if (typeof message === 'string') {
      message = { text: message };
    }

    Object.keys(modules).map(function(moduleName) {
      var module = modules[moduleName] || {}
        , completed = module.completed || {}
        , fields = []
      ;
      Object.keys(completed).forEach(function(testName) {
        var test = completed[testName]
          , skipped = test.skipped > 0
          , failed = test.failed + test.errors > 0
          , assertions = test.assertions || []
          , color = failed ? '#d24939' : skipped ? '#ffa500' : '#00bb00'
          , text = assertions.length + ' assertions, ' + test.time + ' seconds elapsed'
          , fields = []
        ;

        if(sendOnlyFailedTests && failed < 1){
          return;
        }

        assertions.forEach(function(a) {
          if (a.failure) {
            fields.push({
              title: a.message,
              value: a.failure
            })
            if(options.printFailureAssertionOnly){
              attachments.push({
                color: color,
                title: 'testing: ' + testName + ', and moudle: ' + moduleName,
                text: text + '\n\n'
                  + '```\n'
                  + a.message +'\n'
                  + a.failure +'\n'
                  + a.stackTrace
                  + '\n```\n',
              });
            }
          } else {
            if(!options.printFailureAssertionOnly){
              attachments.push({
                color: color,
                title: 'testing: ' + testName + ', and moudle: ' + moduleName,
                text: text + '\n\n'
              });
            }
          }

          // 如果没有message就添加一条message
          if(message === {}){
            if(attachments.length > 1){
              message = attachments[0]
              attachments.shift()
            }else{
              if(!options.printFailureAssertionOnly){
                message = {
                  text: 'test completed **' + results.passed + '**, failed **' + results.failed + '**\n'
                }
              }
            }
          }
        })

      });
    });

    robot.Send(Object.assign({
      attachments: attachments
    }, message), done);
  }

}

module.exports = reporter;

