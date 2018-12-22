import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();
export const PERSON_2_ID = ObjectId().toHexString();
export const PERSON_3_ID = ObjectId().toHexString();

// Organizations
export const ORG_1_ID = ObjectId().toHexString();

export default {
  Person: [
    { _id: PERSON_1_ID, name: "John Smith" },
    { _id: PERSON_2_ID, name: "Jane Doe" },
    { _id: PERSON_3_ID, name: "Joe Bloggs" }
  ],

  Organization: [{
    _id: ORG_1_ID,
    name: "State Government",
    liaisons: [PERSON_1_ID, PERSON_2_ID]
  }]
}