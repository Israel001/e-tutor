const Agenda = require('agenda');

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}-puhqm.gcp.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const connectionOpts = {db: {address: MONGODB_URI, collection: 'agendaJobs'}};

const agenda = new Agenda(connectionOpts);

const jobTypes = process.env.JOB_TYPES ? process.env.JOB_TYPES.split(',') : [];

jobTypes.forEach(type => {
  require(`./jobs/${type}`)(agenda);
});

if (jobTypes.length) {
  agenda.start();
}

module.exports = agenda;
