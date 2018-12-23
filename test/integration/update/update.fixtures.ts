import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();

// Organizations
export const ORG_1_ID = ObjectId().toHexString();

export default {
  Person: [{
    _id: PERSON_1_ID,
    name: "Joe Bloggs"
  }],

  Organization: [{
    _id: ORG_1_ID,
    name: "Organization 1",
    modified: new Date("2015-01-01"),
    liaisons: [ PERSON_1_ID ]
  }]
};
