import { expect } from "chai";
import { FindQuery, FieldExpression, Identifier } from 'json-api';

import fixtures, { PERSON_1_ID } from './find-collections.fixtures';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';

import Resource from 'json-api/build/src/types/Resource';

describe("Fetching collections", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  before(() => clearDatabase());
  before(() => loadFixtures(fixtures));

  describe("Fetching all organizations", () => {
    // This test is good on its own, and the next couple tests also assume it passes.
    it("should contain both organizations and schools", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "organizations",
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      expect(resources.some(it =>
        it.typePath != null && it.typePath.includes("schools")
      )).to.equal(true, 'has schools');
      expect(resources.every(it => it.type === "organizations")).to.equal(true, 'all are organizations');
    });
  });

  describe("Fetching sorted collections", () => {
    it("can sort the primary results in ascending order", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "people",
        sort: [{ direction: 'ASC', field: 'gender' }],
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      const johnJaneList = resources
        .map(it => it.attributes.name)
        .filter(it => ["John", "Jane"].includes(it));

      expect(johnJaneList[0]).to.equal("Jane");
      expect(johnJaneList[1]).to.equal("John");
    });

    it("can sort the primary results in descending order", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "people",
        sort: [{ direction: 'DESC', field: 'gender' }],
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      const johnJaneList = resources
        .map(it => it.attributes.name)
        .filter(it => ["John", "Jane"].includes(it));

      expect(johnJaneList[0]).to.equal("John");
      expect(johnJaneList[1]).to.equal("Jane");
    });

    it("can multi-sort the primary results", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "people",
        sort: [
          { direction: 'DESC', field: 'gender' },
          { direction: 'ASC', field: 'name' }
        ],
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      const johnJaneDougList = resources
        .map(it => it.attributes.name)
        .filter(it => ["John", "Jane", "Doug"].includes(it));

      expect(johnJaneDougList[0]).to.equal("Doug");
      expect(johnJaneDougList[1]).to.equal("John");
      expect(johnJaneDougList[2]).to.equal("Jane");
    });
  });

  describe("Fetching with offset and/or limit (name sorted for determinism)", () => {
    let results;

    before(async () => {
      results = await adapter.find(new FindQuery({
        type: "people",
        sort: [{ direction: 'ASC', field: 'name' }],
        limit: 2,
        offset: 1,
        returning: () => ({})
      }));
    });

    it("should only return exactly the 3 people we expect", () => {
      const resources = results.primary.unwrap() as Resource[]

      expect(resources.map(it => it.attributes.name)).to.deep.equal([
        "Jane",
        "John"
      ]);
    });

    it("Should include the total record count", () => {
      expect(results.collectionSize).to.equal(3);
    });
  });

  describe("Filtering", () => {
    it("should support simple equality filters", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "people",
        filters: [FieldExpression("eq", [ Identifier("name"), "Doug" ])],
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      expect(resources).to.have.length(1);
      expect(resources[0].attributes.name).to.equal("Doug");
    });

    it("should still return resource array even with a single id filter", async () => {
      const { primary } = await adapter.find(new FindQuery({
        type: "people",
        filters: [FieldExpression("eq", [ Identifier("id"), PERSON_1_ID ])],
        returning: () => ({})
      }));

      const resources = primary.unwrap() as Resource[]

      expect(resources).to.be.an("array");
      expect(resources).to.have.length(1);
      expect(resources[0].id).to.equal(PERSON_1_ID);
    });
  });

  describe("Fetching with includes", () => {
    it("should not contain duplicate resources", async () => {
      const { included } = await adapter.find(new FindQuery({
        type: "organizations",
        populates: ['liaisons'],
        returning: () => ({})
      }));

      const janeDoes = included!.filter(it => it.attributes.name === 'Jane');
      expect(janeDoes).to.have.length(1);
    });
  });
});
