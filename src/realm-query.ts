import * as _ from 'lodash';
import { Results } from 'realm';

export type ILogicOperator = 'AND' | 'OR';
export type EqualValueType = string | number | boolean | Date;
export type CompareValueType = number | Date;
export type CriteriaFunc = { (placeholders: string[]): string };
export type CriteriaFuncWrapper = { (): string };

class RealmQuery {
  private objects: Results<any>;
  protected criteria: any[] = [];
  private inGroup = false;
  protected values: any[] = []; // Appending of items is deferred till toString call
  private sortField: string;
  private sortReverse: boolean;

  constructor(objects?: Results<any>) {
    this.objects = objects;
  }

  public _getValues(): any[] {
    return this.values;
  }

  public _getCriteria(): any[] {
    return this.criteria;
  }

  addCriteria(criteriaCallback: CriteriaFunc, criteriaValues: any[] = []): RealmQuery {
    // NOTE: This wrapper function has the side effect of manipulating the 'values' array.
    // NOTE: Which is necessary for generating the proper binding placeholders
    // NOTE: We don't use arrow function because if the criteria of another RealmQuery is joined
    // NOTE: we want 'this' instance to be used for the call such that values are pushed on to the correct instance.
    // NOTE:So in toString() the 'this' instance is passed to .call() invocation
    let criteria: CriteriaFuncWrapper = function () {
      const placeholderCallback = function (value) {
          const index = this.values.length;
          this.values.push(value);
          return `$${index}`;
      };
      const placeholders: string[] = criteriaValues.map(placeholderCallback.bind(this));
      return criteriaCallback(placeholders);
    };
    if (this.inGroup) {
      let lastIndex = this.criteria.length - 1;
      let currentGroup: any[] = this.criteria[lastIndex];
      if (!currentGroup || !_.isArray(currentGroup)) {
        this.criteria.push([]);
        lastIndex += 1;
      }
      this.criteria[lastIndex].push(criteria);
    } else {
      this.criteria.push(criteria);
    }
    return this;
  };
  private getFilteredObjects() {
    const query = this.toString();
    let results = this.objects;
    if (query) {
      results = results.filtered(query, ...this.values);
    }
    return results;
  }
  public toString(): string {
    // Values for bindings must be cleared out since we're calling toString again
    this.values = [];
    let criteriaStr = [];
    let hasNotOperator = false;
    for (let i in this.criteria) {
      if (!_.isArray(this.criteria[i])) {
        const wrapper: CriteriaFuncWrapper = this.criteria[i];
        const criteria: string = wrapper.call(this);
        if ( criteria !== 'NOT') {
          criteriaStr.push(criteria);
        } else {
          hasNotOperator = true;
        }
      } else {
        criteriaStr.push('(' + this.criteria[i].map((wrapper: CriteriaFuncWrapper) => {
          const criteria = wrapper.call(this);
          if (criteria === 'NOT') {
            hasNotOperator = true;
          }
          return criteria;
        }).join(' ') + ')');
      }
    }
    if (hasNotOperator) {
      criteriaStr = [`NOT(${criteriaStr.join(' AND ')})`];
    }
    const criteriaStrValue = criteriaStr.join(' AND ');
    return criteriaStrValue;
  }
  /**
   * Returns the average of a given field
   * @param fieldName {string}
   * @return {number}
   */
  public average(fieldName: string): number {
    let results = this.getFilteredObjects();
    return _.sumBy(_.toArray(results), fieldName) / results.length;
  }
  /**
   * Begin grouping of conditions ("left parenthesis")
   * 
   * @return {RealmQuery}
   */
  public beginGroup(): RealmQuery {
    this.inGroup = true;
    return this;
  }
  /**
   * Condition that the value of field begins with the specified string
   * 
   * @param fieldName {string}
   * @param value {string}
   * @param casing {boolean, optional} BEGINSWITH[c] or BEGINSWITH
   */
  public beginsWith(
    fieldName: string,
    value: string,
    casing?: boolean
  ): RealmQuery {
    const op = casing ? 'BEGINSWITH[c]' : 'BEGINSWITH';
    return this.addCriteria((p: string[]) => {
        return `${fieldName} ${op} ${p[0]}`;
    }, [value]);

  }
  /**
   * Between condition
   * 
   * @param fieldName {string}
   * @param from {CompareValueType}
   * @param to {CompareValueType}
   * @return {RealmQuery}
   */
  public between(
    fieldName: string,
    from: CompareValueType,
    to: CompareValueType
  ): RealmQuery {
    return this.addCriteria((p: string[]) => {
        return `${fieldName} >= ${p[0]} AND ${fieldName} <= ${p[1]}`;
    }, [from, to]);
  }
  /**
   * Condition that value of field contains the specified substring
   * 
   * @param fieldName {string}
   * @param value {string}
   * @param casing {boolean, optional} CONTAINS[c] or CONTAINS
   */
  public contains(
    fieldName: string,
    value: string,
    casing?: boolean
  ): RealmQuery {
    const op = casing ? 'CONTAINS[c]' : 'CONTAINS';
    return this.addCriteria((p: string[]) => {
      return `${fieldName} ${op} ${p[0]}`;
    }, [value]);
  }
  /**
   * Counts the number of objects that fulfill the query conditions
   * 
   * @return {number}
   */
  public count(): number {
    let results = this.getFilteredObjects();
    return results.length;
  }
  /**
   * Returns a distinct set of objects of a specific class.
   * 
   * @param fieldName {string}
   * @return {any[]}
   */
  public distinct(fieldName: string): Array<any> {
    let results = this.getFilteredObjects();
    return _.uniqBy(_.toArray(results), fieldName);
  }
  /**
   * End grouping of conditions ("right parenthesis") which was opened by a call to beginGroup()
   * @return {RealmQuery}
   */
  public endGroup(): RealmQuery {
    this.inGroup = false;
    return this;
  }
  /**
   * Condition that the value of field ends with the specified string
   * 
   * @param fieldName {string}
   * @param value {string}
   * @param casing {boolean, optional} ENDSWITH[c] or ENDSWITH
   * @return {RealmQuery}
   */
  public endsWith(
    fieldName: string,
    value: string,
    casing?: boolean
  ): RealmQuery {
    const op = casing ? 'ENDSWITH[c]' : 'ENDSWITH';
    return this.addCriteria((p: string[]) => {
      return `${fieldName} ${op} ${p[0]}`;
    }, [value]);
  }
  /**
   * Equal-to comparison
   * 
   * @param fieldName {string}
   * @param value {EqualValueType}
   * @return {RealmQuery}
   */
  public equalTo(fieldName: string, value: EqualValueType): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} == ${p[0]}`;
    }, [value]);
  }
  /**
   * Finds all objects that fulfill the query conditions
   * @return {Results}
   */
  public findAll<M>(): Results<M> {
    let results = this.getFilteredObjects();
    if (this.sortField) {
      results = results.sorted(this.sortField, this.sortReverse);
    }
    return results;
  }
  /**
   * Finds the first object that fulfills the query conditions
   */
  public findFirst<M>(): M {
    let results = this.getFilteredObjects();
    return results.length ? results[0] : undefined;
  }
  /**
   * Greater-than comparison
   * 
   * @param fieldName {string}
   * @param value {CompareValueType}
   * @return {RealmQuery}
   */
  public greaterThan(fieldName: string, value: CompareValueType): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} > ${p[0]}`;
    }, [value]);
  }
  /**
   * greater-than-or-equal-to comparison
   * 
   * @param fieldName {string}
   * @param value {CompareValueType}
   * @return {RealmQuery}
   */
  public greaterThanOrEqualTo(
    fieldName: string,
    value: CompareValueType
  ): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} >= ${p[0]}`;
    }, [value]);
  }
  /**
   * In comparison
   * 
   * @param fieldName {string}
   * @param values {EqualValueType[]}
   * @return {RealmQuery}
   */
  public in(fieldName: string, values: EqualValueType[]): RealmQuery {
    return this.addCriteria((placeholders: string[]) => {
        const criteria = [];
        for (let index in placeholders) {
            const placeholder = placeholders[index];
            criteria.push(`${fieldName} == ${placeholder}`);
        }
        return '(' + criteria.join(' OR ') + ')';
    }, values);
  }
  isEmpty(fieldName: string): RealmQuery {
    throw new Error('Not yet supported "isEmpty"');
  }
  isNotEmpty(fieldName: string): RealmQuery {
    throw new Error('Not yet supported "isNotEmpty"');
  }
  isNotNull(fieldName: string): RealmQuery {
    throw new Error('Not yet supported "isNotNull"');
  }
  isNull(fieldName: string): RealmQuery {
    throw new Error('Not yet supported "isNull"');
  }
  /**
   * Less-than comparison
   * 
   * @param fieldName {string}
   * @param value {CompareValueType}
   * @return {RealmQuery}
   */
  public lessThan(fieldName: string, value: CompareValueType): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} < ${p[0]}`;
    }, [value]);
  }
  /**
   * Less-than-or-equal-to comparison
   * 
   * @param fieldName {string}
   * @param value {CompareValueType}
   * @return {RealmQuery}
   */
  public lessThanOrEqualTo(
    fieldName: string,
    value: CompareValueType
  ): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} <= ${p[0]}`
    }, [value]);
  }
  /**
   * 
   * @param fieldName 
   * @param value 
   */
  public like(fieldName: string, value: string): RealmQuery {
    throw new Error('Not yet supported "like"');
  }
  /**
   * Finds the maximum value of a field
   * 
   * @param fieldName {string}
   * @return {any}
   */
  public max(fieldName: string): any {
    let results = this.getFilteredObjects();
    return _.maxBy(_.toArray(results), fieldName);
  }
  /**
   * Finds the miniimum value of a field
   * 
   * @param fieldName {string}
   * @return {any}
   */
  public min(fieldName: string): any {
    let results = this.getFilteredObjects();
    return _.minBy(_.toArray(results), fieldName);
  }
  public not(): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return 'NOT';
    });
  }
  /**
   * Not-equal-to comparison
   * 
   * @param fieldName {string}
   * @param value {EqualValueType}
   * @return {RealmQuery}
   */
  public notEqualTo(fieldName: string, value: EqualValueType): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return `${fieldName} <> ${p[0]}`;
    }, [value]);
  }
  /**
   * AND logic operator. Use in group
   * 
   * @return {RealmQuery}
   */
  public and(): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return 'AND';
    });
  }
  /**
   * OR logic operator. Use in group
   * 
   * @return {RealmQuery}
   */
  public or(): RealmQuery {
    return this.addCriteria((p: string[]) => {
      return 'OR';
    });
  }
  /**
   * Calculates the sum of a given field
   * 
   * @param fieldName {string}
   * @return {number}
   */
  public sum(fieldName: string): number {
    let results = this.getFilteredObjects();
    return _.sumBy(_.toArray(results), fieldName);
  }
  /**
   * Set sorted into realm.objects
   * 
   * @param fieldName {string}
   * @param order {ASC|DESC}
   * @return {RealmQuery}
   */
  public sort(fieldName: string, order?: 'ASC' | 'DESC'): RealmQuery {
    this.sortField = fieldName;
    this.sortReverse = order === 'DESC' ? true : false;
    return this;
  }
  /**
   * Combine to another query
   */
  public join(query: RealmQuery): RealmQuery {
    this.criteria = this.criteria.concat(query.criteria);
    return this;
  }
  /**
   * Create new query
   * @param objects {Realm.Collection}
   */
  static where(objects: Results<any>): RealmQuery {
    return new RealmQuery(objects);
  }
  /**
   * Create new query. Alias of where
   * @param objects {Realm.Collection}
   */
  static create(objects?: Results<any>): RealmQuery {
    return new RealmQuery(objects);
  }
}

export default RealmQuery;
