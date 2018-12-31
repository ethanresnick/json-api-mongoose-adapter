import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();
export const PERSON_2_ID = ObjectId().toHexString();

// Organizations
export const ORG_1_ID = ObjectId().toHexString();

export default {
  Person: [{
    _id: PERSON_1_ID,
    name: 'Joe Bloggs'
  }, {
    _id: PERSON_2_ID,
    name: 'Jane Doe'
  }],

  Organization: [{
    _id: ORG_1_ID,
    name: "Organization 1",
    liaisons: [ PERSON_1_ID, PERSON_2_ID ]
  }]
};
