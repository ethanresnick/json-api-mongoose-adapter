import * as mongoose from 'mongoose';

require('mongoose').Promise = Promise;
mongoose.connect('mongodb://localhost/json-api-mongoose-adapter-test');

import PersonModel from "./person";
import OrganizationModelSchema from "./organization";
import makeSchoolModelConstructor from "./school";

const OrganizationModel = OrganizationModelSchema.model;
const OrganizationSchema = OrganizationModelSchema.schema;

const models = {
  Person: PersonModel,
  Organization: OrganizationModel,
  School: makeSchoolModelConstructor(OrganizationModel, OrganizationSchema)
};

export default models;
