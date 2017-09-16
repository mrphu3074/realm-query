/// <reference types="realm" />
import { Results } from 'realm';
export declare type ILogicOperator = 'AND' | 'OR';
export declare type EqualValueType = string | number | boolean | Date;
export declare type CompareValueType = number | Date;
declare class RealmQuery {
    private objects;
    private criteria;
    private inGroup;
    private sortField;
    private sortReverse;
    constructor(objects?: Results<any>);
    addCriteria(critera: any): RealmQuery;
    private getFilteredObjects();
    toString(): string;
    /**
     * Returns the average of a given field
     * @param fieldName {string}
     * @return {number}
     */
    average(fieldName: string): number;
    /**
     * Begin grouping of conditions ("left parenthesis")
     *
     * @return {RealmQuery}
     */
    beginGroup(): RealmQuery;
    /**
     * Condition that the value of field begins with the specified string
     *
     * @param fieldName {string}
     * @param value {string}
     * @param casing {boolean, optional} BEGINSWITH[c] or BEGINSWITH
     */
    beginsWith(fieldName: string, value: string, casing?: boolean): RealmQuery;
    /**
     * Between condition
     *
     * @param fieldName {string}
     * @param from {CompareValueType}
     * @param to {CompareValueType}
     * @return {RealmQuery}
     */
    between(fieldName: string, from: CompareValueType, to: CompareValueType): RealmQuery;
    /**
     * Condition that value of field contains the specified substring
     *
     * @param fieldName {string}
     * @param value {string}
     * @param casing {boolean, optional} CONTAINS[c] or CONTAINS
     */
    contains(fieldName: string, value: string, casing?: boolean): RealmQuery;
    /**
     * Counts the number of objects that fulfill the query conditions
     *
     * @return {number}
     */
    count(): number;
    /**
     * Returns a distinct set of objects of a specific class.
     *
     * @param fieldName {string}
     * @return {any[]}
     */
    distinct(fieldName: string): Array<any>;
    /**
     * End grouping of conditions ("right parenthesis") which was opened by a call to beginGroup()
     * @return {RealmQuery}
     */
    endGroup(): RealmQuery;
    /**
     * Condition that the value of field ends with the specified string
     *
     * @param fieldName {string}
     * @param value {string}
     * @param casing {boolean, optional} ENDSWITH[c] or ENDSWITH
     * @return {RealmQuery}
     */
    endsWith(fieldName: string, value: string, casing?: boolean): RealmQuery;
    /**
     * Equal-to comparison
     *
     * @param fieldName {string}
     * @param value {EqualValueType}
     * @return {RealmQuery}
     */
    equalTo(fieldName: string, value: EqualValueType): RealmQuery;
    /**
     * Finds all objects that fulfill the query conditions
     * @return {Results}
     */
    findAll<M>(): Results<M>;
    /**
     * Finds the first object that fulfills the query conditions
     */
    findFirst<M>(): M;
    /**
     * Greater-than comparison
     *
     * @param fieldName {string}
     * @param value {CompareValueType}
     * @return {RealmQuery}
     */
    greaterThan(fieldName: string, value: CompareValueType): RealmQuery;
    /**
     * greater-than-or-equal-to comparison
     *
     * @param fieldName {string}
     * @param value {CompareValueType}
     * @return {RealmQuery}
     */
    greaterThanOrEqualTo(fieldName: string, value: CompareValueType): RealmQuery;
    /**
     * In comparison
     *
     * @param fieldName {string}
     * @param values {EqualValueType[]}
     * @return {RealmQuery}
     */
    in(fieldName: string, values: EqualValueType[]): RealmQuery;
    isEmpty(fieldName: string): RealmQuery;
    isNotEmpty(fieldName: string): RealmQuery;
    isNotNull(fieldName: string): RealmQuery;
    isNull(fieldName: string): RealmQuery;
    /**
     * Less-than comparison
     *
     * @param fieldName {string}
     * @param value {CompareValueType}
     * @return {RealmQuery}
     */
    lessThan(fieldName: string, value: CompareValueType): RealmQuery;
    /**
     * Less-than-or-equal-to comparison
     *
     * @param fieldName {string}
     * @param value {CompareValueType}
     * @return {RealmQuery}
     */
    lessThanOrEqualTo(fieldName: string, value: CompareValueType): RealmQuery;
    /**
     *
     * @param fieldName
     * @param value
     */
    like(fieldName: string, value: string): RealmQuery;
    /**
     * Finds the maximum value of a field
     *
     * @param fieldName {string}
     * @return {any}
     */
    max(fieldName: string): any;
    /**
     * Finds the miniimum value of a field
     *
     * @param fieldName {string}
     * @return {any}
     */
    min(fieldName: string): any;
    not(): RealmQuery;
    /**
     * Not-equal-to comparison
     *
     * @param fieldName {string}
     * @param value {EqualValueType}
     * @return {RealmQuery}
     */
    notEqualTo(fieldName: string, value: EqualValueType): RealmQuery;
    /**
     * AND logic operator. Use in group
     *
     * @return {RealmQuery}
     */
    and(): RealmQuery;
    /**
     * OR logic operator. Use in group
     *
     * @return {RealmQuery}
     */
    or(): RealmQuery;
    /**
     * Calculates the sum of a given field
     *
     * @param fieldName {string}
     * @return {number}
     */
    sum(fieldName: string): number;
    /**
     * Set sorted into realm.objects
     *
     * @param fieldName {string}
     * @param order {ASC|DESC}
     * @return {RealmQuery}
     */
    sort(fieldName: string, order?: 'ASC' | 'DESC'): RealmQuery;
    /**
     * Combine to another query
     */
    join(query: any): RealmQuery;
    /**
     * Create new query
     * @param objects {Realm.Collection}
     */
    static where(objects: Results<any>): RealmQuery;
    /**
     * Create new query. Alias of where
     * @param objects {Realm.Collection}
     */
    static create(objects?: Results<any>): RealmQuery;
}
export default RealmQuery;
