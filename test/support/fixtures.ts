import * as mongoose from 'mongoose';
import models from './models';

export const clearDatabase = () => Promise.all(
  Object.keys(mongoose.models)
    .map(name => mongoose.models[name])
    .map(Model => Model.remove({}))
);

export type Fixtures = { [modeName: string]: any[] };
export const loadFixtures = (fixtures: Fixtures) => Promise.all(
  Object.keys(fixtures)
    .map(name => ({ Model: models[name], docs: fixtures[name] }))
    .map(({ Model, docs }) => Model.insertMany(docs))
);
