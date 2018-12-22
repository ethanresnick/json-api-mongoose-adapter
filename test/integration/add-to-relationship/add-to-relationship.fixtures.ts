import * as mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

// People
export const PERSON_1_ID = ObjectId().toHexString();
export const PERSON_2_ID = ObjectId().toHexString();
export const PERSON_3_ID = ObjectId().toHexString();

// Organizations
export const ORG_1_ID = ObjectId().toHexString();
export const ORG_2_ID = ObjectId().toHexString();

// Schools
export const SCHOOL_1_ID = ObjectId().toHexString();
export const SCHOOL_2_ID = ObjectId().toHexString();
export const SCHOOL_3_ID = ObjectId().toHexString();
export const SCHOOL_4_ID = ObjectId().toHexString();

export default {
  Person: [
    { _id: PERSON_1_ID, name: "John Smith", email: "jsmith@gmail.com", gender: "male" },
    { _id: PERSON_2_ID, name: "Jane Doe", gender: "female", manages: SCHOOL_3_ID, homeSchool: SCHOOL_3_ID },
    { _id: PERSON_3_ID, name: "Jordi Jones", gender: "other" }
  ],

  Organization: [{
    _id: ORG_1_ID,
    name: "State Government",
    description: "Representing the good people.",
    liaisons: [PERSON_1_ID],
    location:  { type: "Point",  coordinates: [ -73.9667, 40.78 ] }
  }, {
    _id: ORG_2_ID,
    name: "Org whose echo prop I'll change",
    reversed: "Test",
    liaisons: [PERSON_2_ID],
    modified: new Date("2015-01-01"),
    location:  { type: "Point",  coordinates: [ 10, 10 ] }
  }],

  School: [
    { _id: SCHOOL_1_ID, name: "City College", description: "Just your average local college.", liaisons: [PERSON_1_ID]},
    { _id: SCHOOL_2_ID, name: "State College", description: "Just your average state college."},
    { _id: SCHOOL_3_ID, name: "Elementary School", description: "For the youngins.", principal: PERSON_1_ID },
    { _id: SCHOOL_4_ID, name: "TO PATCH BY SUBTYPES TESTS" }
  ]
}