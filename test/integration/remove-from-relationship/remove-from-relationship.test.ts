import { expect } from "chai";
import { RemoveFromRelationshipQuery, ResourceIdentifier } from 'json-api';
import { RemoveFromRelationshipQueryOptions } from 'json-api/build/src/types/Query/RemoveFromRelationshipQuery';

import '../../support/models';
import * as mongoose from 'mongoose';
import MongooseAdapter from '../../../src/MongooseAdapter';

import { clearDatabase, loadFixtures } from '../../support/fixtures';
import fixtures, {
  ORG_1_ID,
  PERSON_1_ID,
  PERSON_2_ID,
  PERSON_3_ID
} from './remove-from-relationship.fixtures';

const { Organization } = mongoose.models;

describe("Removing from a to-many relationship at a relationship endpoint", () => {
  let adapter: MongooseAdapter;

  before(() => {
    adapter = new MongooseAdapter(mongoose.models);
  });

  const removeFromRel = async (linkage: RemoveFromRelationshipQueryOptions['linkage']) => {
    const query = removeFromRelQuery(linkage);

    const {
      before: beforeRel,
      after: afterRel
    } = await adapter.removeFromRelationship(query);

    const pre = beforeRel ? <any[]>beforeRel.toJSON({}).data : [];
    const post = afterRel ? <any[]>afterRel.toJSON({}).data : [];

    return { pre, post };
  };

  const removeFromRelQuery = (linkage: RemoveFromRelationshipQueryOptions['linkage']) => new RemoveFromRelationshipQuery({
    type: 'organizations',
    id: ORG_1_ID,
    relationshipName: 'liaisons',
    returning: () => ({}),
    catch: () => ({}),
    linkage
  });

  const checkSavedLiaisons = async (people: string[]) => {
    const org = await Organization
      .findById(ORG_1_ID)
      .select('liaisons');

    const sortedActual = org.liaisons
      .map(l => l.toString())
      .sort();

    const sortedExpected = people.sort();

    expect(sortedActual).to.deep.equal(sortedExpected);
  };

  describe("Removing an existing value", () => {
    let results;

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      results = await removeFromRel([
        new ResourceIdentifier('people', PERSON_2_ID)
      ]);
    });

    it("returns pre and post states with new linkage added", () => {
      expect(results.pre).to.have.lengthOf(2);
      expect(results.post).to.have.lengthOf(1);
    });

    it("returns linkage without the removed value", () => {
      const removed = results.pre.find(
        candidate => !results.post.find(existing => existing.id === candidate.id)
      );

      expect(removed.id).equals(PERSON_2_ID);
    });

    it("gives all relationship data the correct linkage type", () => {
      expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
      expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
    });

    it('removes the linkage from the database', async () => {
      await checkSavedLiaisons([ PERSON_1_ID ]);
    });
  });

  describe("Removing a value that isn't in the relationship", () => {
    let results;

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      results = await removeFromRel([
        new ResourceIdentifier('people', PERSON_3_ID)
      ]);
    });

    it("returns matching pre and post states", () => {
      expect(results.pre).to.deep.equal(results.post);
    });

    it("gives all relationship data the correct linkage type", () => {
      expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
      expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
    });

    it('does not change the linkage in the database', async () => {
      await checkSavedLiaisons([ PERSON_1_ID, PERSON_2_ID ]);
    });
  });

  describe("Removing the same linkage multiple times in the same query", () => {
    let results;

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      results = await removeFromRel([
        new ResourceIdentifier('people', PERSON_2_ID),
        new ResourceIdentifier('people', PERSON_2_ID)
      ]);
    });

    it("returns correct length arrays for pre and post states", () => {
      expect(results.pre).to.have.lengthOf(2);
      expect(results.post).to.have.lengthOf(1);
    });

    it("returns linkage without the removed value", () => {
      const removed = results.pre.find(
        candidate => !results.post.find(existing => existing.id === candidate.id)
      );

      expect(removed.id).equals(PERSON_2_ID);
    });

    it("gives all relationship data the correct linkage type", () => {
      expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
      expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
    });

    it('removes the linkage from the database', async () => {
      await checkSavedLiaisons([ PERSON_1_ID ]);
    });
  });

  describe("Providing an empty linkage array", () => {
    let results;

    before(() => clearDatabase());
    before(() => loadFixtures(fixtures));

    before(async () => {
      results = await removeFromRel([]);
    });

    it("returns matching pre and post states", () => {
      expect(results.pre).to.deep.equal(results.post);
    });

    it("gives all relationship data the correct linkage type", () => {
      expect(results.pre.every(({ type }) => type === 'people')).to.be.ok;
      expect(results.post.every(({ type }) => type === 'people')).to.be.ok;
    });

    it('does not change the linkage in the database', async () => {
      await checkSavedLiaisons([ PERSON_1_ID, PERSON_2_ID ]);
    });
  });
});
