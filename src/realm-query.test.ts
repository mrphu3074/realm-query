import * as mocha from 'mocha';
import * as _ from 'lodash';
import * as Realm from 'realm';
import RealmQuery from './realm-query';
import { expect } from 'chai';

describe("RealmQuery", function () {
  let query: RealmQuery;
  beforeEach(function () {
    query = RealmQuery.create();
  });

  it('should able to add new criteria', function () {
    expect(query['criteria'].length).to.equal(0);
    query.addCriteria(() => 'id == 1')
    expect(query['criteria'].length).to.equal(1);
  });

  describe("equalTo", function () {
    it('equalTo number', function () {
      const value = 1001;
      query.equalTo('id', value);
      expect(query.toString()).to.equal('id == $0');
      expect(query._getValues()).to.deep.equal([value]);
    });

    it('equalTo string', function () {
      const value = "username";
      query.equalTo('name', value);
      expect(query.toString()).to.equal('name == $0');
      expect(query._getValues()).to.deep.equal([value]);
    });

    it('equalTo date', function () {
      const now = new Date();
      query.equalTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt == $0');
      expect(query._getValues()).to.deep.equal([now]);
    });

    it('equalTo boolean', function () {
      const value = true;
      query.equalTo('isDeleted', value);
      expect(query.toString()).to.equal('isDeleted == $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
  });

  describe("notEqualTo", function () {

    it('notEqualTo number', function () {
      const value = 1001;
      query.notEqualTo('id', value);
      expect(query.toString()).to.equal('id <> $0');
      expect(query._getValues()).to.deep.equal([value]);
    });

    it('notEqualTo string', function () {
      const value = 'username';
      query.notEqualTo('name', value);
      expect(query.toString()).to.equal('name <> $0');
      expect(query._getValues()).to.deep.equal([value]);
    });

    it('notEqualTo date', function () {
      const now = new Date();
      query.notEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt <> $0');
      expect(query._getValues()).to.deep.equal([now]);
    });

    it('notEqualTo boolean', function () {
      const value = true;
      query.notEqualTo('isDeleted', value);
      expect(query.toString()).to.equal('isDeleted <> $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
  });

  describe("beginsWith", function () {
    const value = 'phu';
    it('beginsWith not casing', function () {
      query.beginsWith('name', value);
      expect(query.toString()).to.equal('name BEGINSWITH $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it('beginsWith casing', function () {
      query.beginsWith('name', value, true);
      expect(query.toString()).to.equal('name BEGINSWITH[c] $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
  });

  describe("endsWith", function () {
    const value = 'phu';
    it('endsWith not casing', function () {
      query.endsWith('name', value);
      expect(query.toString()).to.equal('name ENDSWITH $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it('endsWith casing', function () {
      query.endsWith('name', value, true);
      expect(query.toString()).to.equal('name ENDSWITH[c] $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
  });
  describe("contains", function () {
    const value = 'phu';
    it('contains not casing', function () {
      query.contains('name', value);
      expect(query.toString()).to.equal('name CONTAINS $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it('contains casing', function () {
      query.contains('name', 'phu', true);
      expect(query.toString()).to.equal('name CONTAINS[c] $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
  });

  describe("between", function () {
    it('between number to number', function () {
      const from = 20, to = 30;
      query.between('age', from, to);
      expect(query.toString()).to.equal('age >= $0 AND age <= $1');
      expect(query._getValues()).to.deep.equal([from, to]);
    });
    it('between date to date', function () {
      const start = new Date();
      const end = new Date();
      query.between('createdAt', start, end);
      expect(query.toString()).to.equal(`createdAt >= $0 AND createdAt <= $1`);
      expect(query._getValues()).to.deep.equal([start, end]);
    });
  });

  describe("Basic comparison", function () {

    it("greaterThan number", function () {
      const value = 20;
      query.greaterThan('age', value);
      expect(query.toString()).to.equal('age > $0');
      expect(query._getValues()).to.deep.equal([20]);
    });

    it("greaterThan a date", function () {
      const now = new Date();
      query.greaterThan('createdAt', now);
      expect(query.toString()).to.equal('createdAt > $0');
      expect(query._getValues()).to.deep.equal([now]);
    });

    it("greaterThanOrEqualTo number", function () {
      const value = 20;
      query.greaterThanOrEqualTo('age', value);
      expect(query.toString()).to.equal('age >= $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it("greaterThanOrEqualTo a date", function () {
      const now = new Date();
      query.greaterThanOrEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt >= $0');
      expect(query._getValues()).to.deep.equal([now]);
    });

    it("lessThan number", function () {
      const value = 20;
      query.lessThan('age', value);
      expect(query.toString()).to.equal('age < $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it("lessThan a date", function () {
      const now = new Date();
      query.lessThan('createdAt', now);
      expect(query.toString()).to.equal('createdAt < $0');
      expect(query._getValues()).to.deep.equal([now]);
    });

    it("lessThanOrEqualTo number", function () {
      const value = 20;
      query.lessThanOrEqualTo('age', value);
      expect(query.toString()).to.equal('age <= $0');
      expect(query._getValues()).to.deep.equal([value]);
    });
    it("lessThanOrEqualTo a date", function () {
      const now = new Date();
      query.lessThanOrEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt <= $0');
      expect(query._getValues()).to.deep.equal([now]);
    });
  });
  describe('In', function () {
    it('In array of number', function () {
      const values = [1, 2];
      query.in('id', values);
      expect(query.toString()).to.equal('(id == $0 OR id == $1)');
      expect(query._getValues()).to.deep.equal(values);
    });
    it('In array of string', function () {
      const values = ["ACTIVE", "DEACTIVE"];
      query.in('status', values);
      expect(query.toString()).to.equal('(status == $0 OR status == $1)');
      expect(query._getValues()).to.deep.equal(values);
    });
    it('In array of mix values', function () {
      const values = [1001, "abcd"];
      query.in('id', values);
      expect(query.toString()).to.equal('(id == $0 OR id == $1)');
      expect(query._getValues()).to.deep.equal(values);
    });
  });

  describe('Query with compound criterias', function () {
    it('complex query with or', function () {
      const name = 'phu', age = 25, ids = [1001, 1002];
      query
        .contains('name', name, true)
        .beginGroup()
        .greaterThan('age', age)
        .or()
        .in('id', ids)
      ;
      let expectedFilters = 'name CONTAINS[c] $0 AND (age > $1 OR (id == $2 OR id == $3))';
      expect(query.toString()).to.equal(expectedFilters);
      expect(query._getValues()).to.deep.equal([name, age, ids[0], ids[1]]);

    });

    it('complex query with and', function () {
      const name = 'phu', age = 25, ids = [1001, 1002];
      query
        .contains('name', name, true)
        .beginGroup()
        .greaterThan('age', age)
        .and()
        .in('id', ids)
      ;
      let expectedFilters = 'name CONTAINS[c] $0 AND (age > $1 AND (id == $2 OR id == $3))';
      expect(query.toString()).to.equal(expectedFilters);
      expect(query._getValues()).to.deep.equal([name, age, ids[0], ids[1]]);
    });
    it('complex query with not', function () {
      const name = 'phu', age = 25, ids = [1001, 1002];
      query
        .not()
        .contains('name', name, true)
        .beginGroup()
        .greaterThan('age', age)
        .and()
        .in('id', ids)
      ;

      let expectedFilted = 'NOT(name CONTAINS[c] $0 AND (age > $1 AND (id == $2 OR id == $3)))';
      expect(query.toString()).to.equal(expectedFilted);
      expect(query._getValues()).to.deep.equal([name, age, ids[0], ids[1]]);
    });

    it('combine complex query', function () {
      const name = 'phu', ids = [1001, 1002];
      query.contains('name', name, true);
      let query2 = RealmQuery.create().in('id', ids);
      query.join(query2);
      expect(query.toString()).to.equal('name CONTAINS[c] $0 AND (id == $1 OR id == $2)');
      expect(query._getValues()).to.deep.equal([name, ids[0], ids[1]]);
    });
  });


});


describe('Get objects with RealmQuery', function () {
  let PersonSchema = {
    name: 'Person',
    properties: {
      id: 'int',
      name: 'string',
      age: 'int',
      createdAt: 'date'
    }
  }
  let realm = new Realm({
    path: 'io.izlab.realmquery.test',
    schema: [PersonSchema]
  });
  realm.write(() => {
    realm.deleteAll();
    realm.create('Person', { id: 1, name: 'clinton', age: 18, createdAt: new Date("2004-12-06 03:34:06") });
    realm.create('Person', { id: 2, name: 'necati', age: 34, createdAt: new Date("2011-09-26 16:42:17") });
    realm.create('Person', { id: 3, name: 'norman', age: 28, createdAt: new Date("2015-06-14 20:57:46") });
    realm.create('Person', { id: 4, name: 'elias', age: 42, createdAt: new Date("2006-06-13 04:35:02") });
    realm.create('Person', { id: 5, name: 'martin', age: 18, createdAt: new Date("2003-01-14 14:12:50") });
  });

  it('Find all', function () {
    let query = RealmQuery.where(realm.objects('Person'));
    let results = query.findAll();
    expect(results.length).to.equal(5);
  });

  it('Find all with filtered', function () {
    let query = RealmQuery
      .where(realm.objects('Person'))
      .greaterThan('age', 30);
    const results = query.findAll();
    expect(results.length).to.equal(2);
  });

  it('Find first', function () {
    let query = RealmQuery.where(realm.objects('Person'));
    let result = query.findFirst();
    let expected = realm.objects('Person')[0];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });

  it('Find first with filtered', function () {
    let result = RealmQuery
      .where(realm.objects('Person'))
      .greaterThan('age', 30)
      .findFirst();
    let expected = realm.objects('Person').filtered('age > 30')[0];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
  });

  it('Find all with less than date filter', function () {
      let query = RealmQuery
          .where(realm.objects('Person'))
          .lessThan('createdAt', new Date("2010-01-01 00:00:00"));
      const results = query.findAll();
      expect(results.length).to.equal(3);
  });

  it('Count', function () {
    let total = RealmQuery
      .where(realm.objects('Person'))
      .count();
    expect(total).to.equal(5);
  });

  it('Count with filtered', function () {
    let total = RealmQuery
      .where(realm.objects('Person'))
      .greaterThan('age', 30)
      .count();
    expect(total).to.equal(2);
  });
  it('Distinct', function () {
    let results = RealmQuery
      .where(realm.objects('Person'))
      .distinct('age');
    expect(results.length).to.equal(4);
  });
  it('Average', function () {
    let avg = RealmQuery
      .where(realm.objects('Person'))
      .average('age');
    let expected = 0;
    let allPersons = realm.objects('Person');
    allPersons.map(p => expected += p['age']);
    expected = expected / allPersons.length;
    expect(avg).to.equal(expected);
  });
  it('Sum', function () {
    let sum = RealmQuery
      .where(realm.objects('Person'))
      .sum('age');
    let expected = 0;
    let allPersons = realm.objects('Person');
    allPersons.map(p => expected += p['age']);
    expect(sum).to.equal(expected);
  });
  it('Max', function () {
    let result = RealmQuery.where(realm.objects('Person')).max('age');
    expect(result['age']).to.equal(42);
  });
  it('Min', function () {
    let result = RealmQuery.where(realm.objects('Person')).min('age');
    expect(result['age']).to.equal(18);
  });
  it('should sort by age ASC', function () {
    let results = RealmQuery.where(realm.objects('Person')).sort('age').findAll();
    let actual = JSON.stringify(_.map(_.toArray(results), 'age'));
    let expected = JSON.stringify([18, 18, 28, 34, 42]);
    expect(actual).to.equal(expected);
  });
  it('should sort by age DESC', function () {
    let results = RealmQuery.where(realm.objects('Person')).sort('age', 'DESC').findAll();
    let actual = JSON.stringify(_.map(_.toArray(results), 'age'));
    let expected = JSON.stringify([42, 34, 28, 18, 18]);
    expect(actual).to.equal(expected);
  });

});

describe('Methods that RealmQuery not yet supported', function () {
  let query;
  beforeEach(() => {
    query = RealmQuery.create();
  })
  it('isEmpty', function () {
    expect(query.isEmpty).to.throw('Not yet supported "isEmpty');
  })
  it('isNotEmpty', function () {
    expect(query.isNotEmpty).to.throw('Not yet supported "isNotEmpty');
  })
  it('isNotNull', function () {
    expect(query.isNotNull).to.throw('Not yet supported "isNotNull');
  })
  it('isNull', function () {
    expect(query.isNull).to.throw('Not yet supported "isNull');
  })
  it('like', function () {
    expect(query.like).to.throw('Not yet supported "like');
  })
});