const Slack = require('./slack');

export default function () {
  return {
    noColors: true,

    reportTaskStart (startTime, userAgents, testCount) {
      this.startTime = startTime;
      this.testCount = testCount;
      this.agentsInfo = `\`Running tests in: ${userAgents}\``;
      this.failedTests = {};
      this.currentFixture = '';
    },

    reportFixtureStart (name) {
      this.currentFixture = `*${name}*`;
      this.failedTests[this.currentFixture] = [];
    },

    reportTestDone (name, err) {
      if (err.errs.length) {
        this.failedTests[this.currentFixture].push(`✗ ${name}`);
      }
    },

    reportTaskDone (endTime, passed) {
      const durationMs = endTime - this.startTime;
      const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');
      let text = `${this.agentsInfo}\n`;

      if (passed !== this.testCount) {
        Object.keys(this.failedTests).forEach(fixture => {
          if (this.failedTests[fixture].length) {
            text = `${text}\n${fixture}\n`;
            this.failedTests[fixture].forEach(testName => {
              text = `${text}\n\t${testName}`;
            });
            text = `${text}\n`;
          }
        });
        text = `${text}\n*${this.testCount - passed}/${this.testCount} tests failed (Duration: ${durationStr})*`;
        Slack.sendErrorMessage(text);
        return;
      }

      text = `${text}\n*All tests passed (Duration: ${durationStr})*`;
      Slack.sendSuccessMessage(text);
    }
  };
}
