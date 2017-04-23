[![CircleCI](https://circleci.com/gh/mrphu3074/realm-query/tree/master.svg?style=svg)](https://circleci.com/gh/mrphu3074/realm-query/tree/master)

---- 

# Realm Query

A query builder for realm.js inspired of Realm Java's query engine.

https://realm.io/docs/java/latest/#queries

## Installation

```console
$ npm install --save realm-query
# or
$ yarn add realm-query
```

## Usage

```javascript
const RealmQuery = require('realm-query');
const realm = new Realm({...});

// Way 1
let query = RealmQuery
  .create()
  .contains('name', 'phu', true)
  .in('id', [1001, 1002]);

// get objects
// query.toString() = name CONTAINS[c] "phu" AND (id == 1001 OR id == 1002)
let results = realm.objects('Person').filtered(query.toString());

// Way 2. use lib to get objects
let results = RealmQuery
                .where(realm.objects('Person'))
                .contains('name', 'phu', true)
                .in('id', [1001, 1002])
                .findAll()

// Complex query
let results = RealmQuery
                .where(realm.objects('Person'))
                .contains('name', 'phu', true)
                .beginGroup()
                  .in('id', [1001, 1002])
                  .or()
                  .between('age', 20, 45)
                .endGroup()
                .sort('id', 'DESC')
                .findAll()
// It will query like this
// name CONTAINS[c] "phu" AND ((id == 1001 OR id == 1002) OR (age >= 20 AND age <= 45))
// and sort by id desc
```

## API

- #### average(fieldName: string): number
  _Returns the average of a given field_

- #### beginGroup(): RealmQuery
  _Begin grouping of conditions ("left parenthesis")_

- #### beginsWith(fieldName: string, value: string, casing?: boolean): RealmQuery
  _Condition that the value of field begins with the specified string_

- #### between(fieldName: string, from: number|date, to: number|date): RealmQuery
  _Between condition_

- #### contains(fieldName: string, value: string, casing?: boolean): RealmQuery
  _Condition that value of field contains the specified substring_

- #### count(): number
  _Counts the number of objects that fulfill the query conditions_

- #### distinct(fieldName: string): Array<ResultItem>
  _Returns a distinct set of objects of a specific class._

- #### endGroup(): RealmQuery
  _End grouping of conditions ("right parenthesis") which was opened by a call to beginGroup()_

- #### endsWith(fieldName: string, value: string, casing?: boolean): RealmQuery
  _Condition that the value of field ends with the specified string_

- #### equalTo(fieldName: string, value: string|number|boolean|date): RealmQuery
  _Equal-to comparison_

- #### findAll(): ReamResults
  _Returns the average of a given field_

  _Finds all objects that fulfill the query conditions_

- #### findFirst(): Object
  
  _Finds the first object that fulfills the query conditions_

- #### greaterThan(fieldName: string, value: number|date): RealmQuery
  _Greater-than comparison_

- #### greaterThanOrEqualTo(fieldName: string, value: number|date): RealmQuery
  _greater-than-or-equal-to comparison_

- #### in(fieldName: string, values: string|number[]): RealmQuery
  _In comparison_

- #### lessThan(fieldName: string, value: number|date): RealmQuery
  _Less-than comparison_

- #### lessThanOrEqualTo(fieldName: string, value: number|date): RealmQuery
  _Less-than-or-equal-to comparison_

- #### max(fieldName: string): Object
  _Finds the maximum value of a field_

- #### min(fieldName: string): Object
  _Finds the miniimum value of a field_

- #### not(): RealmQuery
  _Negate condition_
  
- #### notEqualTo(fieldName: string, value: string|number|boolean|date): RealmQuery
  _Not-equal-to comparison_
  
- #### and(): RealmQuery
  _AND logic operator. Use in group_
  
- #### or(): RealmQuery
  _OR logic operator. Use in group_
  ```javascript
  let results = RealmQuery
        .where(realm.objects('Person'))
        .contains('name', 'phu', true)
        .beginGroup()
          .in('id', [1001, 1002])
          .or()
          .between('age', 20, 45)
        .endGroup()
        .findAll()
  ```

- #### sum(): number
  _Calculates the sum of a given field_

- #### sort(fieldName: string, order?: 'ASC' | 'DESC'): RealmQuery
  _Set sorted into realm.objects_

- #### join(query: RealmQuery): RealmQuery
  _Join queries_
  ```javascript
  let query1 = RealmQuery
    .where(realm.objects('Person'))
    .in('id', [1001, 1002])
  let query2 = RealmQuery
    .where(realm.objects('Person'))
    .greaterThan('age', 25);
  query1.join(query2);
  
  query1.toString = (id == 1001 OR id == 1002) AND age > 25
  ```

- #### where(objects?: RealmResults): RealmQuery
  _Create new query_

- #### create(objects?: RealmResults): RealmQuery
  _Create new query. Alias of where_

---

## [Changelog](CHANGELOG.md)

## [License](LICENSE)
