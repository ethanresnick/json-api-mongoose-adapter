import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();

export default {
  Person: [
    { _id: PERSON_1_ID, name: "John Smith" }
  ]
};
