require('dotenv').config();
const mongoose = require('mongoose');
const Signup = require('./models/Signup');
const Member = require('./models/Member');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const signups = await Signup.find({ role: 'member', flat: { $ne: null } });
    for (let s of signups) {
      const existing = await Member.findOne({ address: String(s.flat), services: s.wing });
      if (!existing) {
        await Member.create({
          name: s.name,
          email: s.email,
          mobile: s.mobile,
          address: String(s.flat),
          services: s.wing
        });
      }
    }
    console.log('Sync complete');
    process.exit(0);
  })
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
