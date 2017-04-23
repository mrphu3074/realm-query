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

  it('should able to add new criteria', function() {
    expect(query['criteria'].length).to.equal(0);
    query.addCriteria('id == 1');
    expect(query['criteria'].length).to.equal(1);
  })

  describe("equalTo", function () {
    it('equalTo number', function () {
      query.equalTo('id', 1001);
      expect(query.toString()).to.equal('id == 1001');
    });

    it('equalTo string', function () {
      query.equalTo('name', "username");
      expect(query.toString()).to.equal('name == "username"');
    });

    it('equalTo date', function () {
      const now = new Date();
      query.equalTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt == ' + now.toString());
    });

    it('equalTo boolean', function () {
      query.equalTo('isDeleted', true);
      expect(query.toString()).to.equal('isDeleted == true');
    });
  });

  describe("notEqualTo", function () {

    it('notEqualTo number', function () {
      query.notEqualTo('id', 1001);
      expect(query.toString()).to.equal('id <> 1001');
    });

    it('notEqualTo string', function () {
      query.notEqualTo('name', "username");
      expect(query.toString()).to.equal('name <> "username"');
    });

    it('notEqualTo date', function () {
      const now = new Date();
      query.notEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt <> ' + now.toString());
    });

    it('notEqualTo boolean', function () {
      query.notEqualTo('isDeleted', true);
      expect(query.toString()).to.equal('isDeleted <> true');
    });
  });

  describe("beginsWith", function () {
    it('beginsWith not casing', function () {
      query.beginsWith('name', 'phu');
      expect(query.toString()).to.equal('name BEGINSWITH "phu"');
    });
    it('beginsWith casing', function () {
      query.beginsWith('name', 'phu', true);
      expect(query.toString()).to.equal('name BEGINSWITH[c] "phu"');
    });
  });

  describe("endsWith", function () {
    it('endsWith not casing', function () {
      query.endsWith('name', 'phu');
      expect(query.toString()).to.equal('name ENDSWITH "phu"');
    });
    it('endsWith casing', function () {
      query.endsWith('name', 'phu', true);
      expect(query.toString()).to.equal('name ENDSWITH[c] "phu"');
    });
  });
  describe("contains", function () {
    it('contains not casing', function () {
      query.contains('name', 'phu');
      expect(query.toString()).to.equal('name CONTAINS "phu"');
    });
    it('contains casing', function () {
      query.contains('name', 'phu', true);
      expect(query.toString()).to.equal('name CONTAINS[c] "phu"');
    });
  });

  describe("between", function () {
    it('between number to number', function () {
      query.between('age', 20, 30);
      expect(query.toString()).to.equal('age >= 20 AND age <= 30');
    });
    it('between date to date', function () {
      const start = new Date();
      const end = new Date();
      query.between('createdAt', start, end);
      expect(query.toString()).to.equal(`createdAt >= ${start} AND createdAt <= ${end}`);
    });
  });

  describe("Basic comparation", function () {

    it("greaterThan number", function () {
      query.greaterThan('age', 20);
      expect(query.toString()).to.equal('age > 20');
    });

    it("greaterThan a date", function () {
      const now = new Date();
      query.greaterThan('createdAt', now);
      expect(query.toString()).to.equal('createdAt > ' + now.toString());
    });

    it("greaterThanOrEqualTo number", function () {
      query.greaterThanOrEqualTo('age', 20);
      expect(query.toString()).to.equal('age >= 20');
    });
    it("greaterThanOrEqualTo a date", function () {
      const now = new Date();
      query.greaterThanOrEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt >= ' + now.toString());
    });

    it("lessThan number", function () {
      query.lessThan('age', 20);
      expect(query.toString()).to.equal('age < 20');
    });
    it("lessThan a date", function () {
      const now = new Date();
      query.lessThan('createdAt', now);
      expect(query.toString()).to.equal('createdAt < ' + now.toString());
    });

    it("lessThanOrEqualTo number", function () {
      query.lessThanOrEqualTo('age', 20);
      expect(query.toString()).to.equal('age <= 20');
    });
    it("lessThanOrEqualTo a date", function () {
      const now = new Date();
      query.lessThanOrEqualTo('createdAt', now);
      expect(query.toString()).to.equal('createdAt <= ' + now.toString());
    });
  });
  describe('In', function () {
    it('In array of number', function () {
      query.in('id', [1, 2])
      expect(query.toString()).to.equal('(id == 1 OR id == 2)');
    })
    it('In array of string', function () {
      query.in('status', ["ACTIVE", "DEACTIVE"])
      expect(query.toString()).to.equal('(status == "ACTIVE" OR status == "DEACTIVE")');
    });
    it('In array of mix values', function () {
      query.in('id', [1001, "abcd"])
      expect(query.toString()).to.equal('(id == 1001 OR id == "abcd")');
    });
  });

  describe('Query with compound criterias', function () {
    it('complex query with or', function () {
      query
        .contains('name', 'phu', true)
        .beginGroup()
        .greaterThan('age', 25)
        .or()
        .in('id', [1001, 1002])

      let expectedFilted = 'name CONTAINS[c] "phu" AND (age > 25 OR (id == 1001 OR id == 1002))'
      expect(query.toString()).to.equal(expectedFilted);
    });

    it('complex query with and', function () {
      query
        .contains('name', 'phu', true)
        .beginGroup()
        .greaterThan('age', 25)
        .and()
        .in('id', [1001, 1002])

      let expectedFilted = 'name CONTAINS[c] "phu" AND (age > 25 AND (id == 1001 OR id == 1002))'
      expect(query.toString()).to.equal(expectedFilted);
    });
    it('complex query with not', function () {
      query
        .not()
        .contains('name', 'phu', true)
        .beginGroup()
        .greaterThan('age', 25)
        .and()
        .in('id', [1001, 1002])

      let expectedFilted = 'NOT(name CONTAINS[c] "phu" AND (age > 25 AND (id == 1001 OR id == 1002)))'
      expect(query.toString()).to.equal(expectedFilted);
    });

    it('combine complex query', function () {
      query = RealmQuery.create().contains('name', 'phu', true);
      let query2 = RealmQuery.create().in('id', [1001, 1002]);
      query.join(query2);
      expect(query.toString()).to.equal('name CONTAINS[c] "phu" AND (id == 1001 OR id == 1002)');
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
    let results = RealmQuery
      .where(realm.objects('Person'))
      .greaterThan('age', 30)
      .findAll()
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
      .findFirst()
    let expected = realm.objects('Person').filtered('age > 30')[0];
    expect(JSON.stringify(result)).to.equal(JSON.stringify(expected));
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