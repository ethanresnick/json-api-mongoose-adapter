import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();
export const PERSON_2_ID = ObjectId().toHexString();
export const PERSON_3_ID = ObjectId().toHexString();

// Organizations
export const ORG_1_ID = ObjectId().toHexString();

// Schools
export const SCHOOL_1_ID = ObjectId().toHexString();

export default {
  Person: [{
    _id: PERSON_1_ID,
    name: 'John',
    gender: 'male'
  }, {
    _id: PERSON_2_ID,
    name: 'Jane',
    gender: 'female'
  }, {
    _id: PERSON_3_ID,
    name: 'Doug',
    gender: 'male'
  }],

  Organization: [{
    _id: ORG_1_ID,
    name: "Organization 1",
    liaisons: [ PERSON_1_ID, PERSON_2_ID ]
  }],

  School: [{
    _id: SCHOOL_1_ID,
    name: "School 1",
    liaisons: [ PERSON_1_ID, PERSON_2_ID ]
  }]
};
