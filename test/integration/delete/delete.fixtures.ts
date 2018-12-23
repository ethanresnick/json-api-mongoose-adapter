import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// Organizations
export const ORG_1_ID = ObjectId().toHexString();
export const ORG_2_ID = ObjectId().toHexString();
export const ORG_3_ID = ObjectId().toHexString();

export default {
  Organization: [{
    _id: ORG_1_ID,
    name: "Organization 1",
    liaisons: []
  }, {
    _id: ORG_2_ID,
    name: "Organization 2",
    liaisons: []
  }, {
    _id: ORG_3_ID,
    name: "Organization 3",
    liaisons: []
  }]
}