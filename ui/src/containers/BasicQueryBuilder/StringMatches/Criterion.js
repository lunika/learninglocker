import React, { Component, PropTypes } from 'react';
import { List, Map, Set } from 'immutable';
import { connect } from 'react-redux';
import classNames from 'classnames';
import Operator from '../Operator';
import TextInputGroup from 'ui/components/TextInputGroup';
class Criterion extends Component {
  static propTypes = {
    section: PropTypes.instanceOf(Map),
    criterion: PropTypes.instanceOf(Map),
    onCriterionChange: PropTypes.func,
    onDeleteCriterion: PropTypes.func,
  }

  state = {
    tempOperator: 'In'
  }

  shouldComponentUpdate = ({ section, criterion }, { tempOperator }) => !(
    this.props.section.equals(section) &&
    this.props.criterion.equals(criterion) &&
    this.state.tempOperator === tempOperator
  );

  canDeleteCriterion = () =>
    this.props.onDeleteCriterion !== undefined

  getOptionQuery = option =>
    this.props.section.get('getModelQuery')(option)

  getOptionDisplay = option =>
    this.props.section.get('getModelDisplay')(option)

  getQueryOption = query =>
    this.props.section.get('getQueryModel')(query)

  getOptionIdentifier = option =>
    this.props.section.get('getModelIdent')(option)

  getCriterionQuery = (operator, criterion) => {
    switch (operator) {
      case 'Out': return new Map({ $nor: criterion });
      default: return new Map({ $or: criterion });
    }
  }

  getValues = () => {
    if (!this.canDeleteCriterion()) return new List();
    const operator = this.getOperator();
    if (operator === 'Out') return this.props.criterion.get('$nor', new List());
    return this.props.criterion.get('$or', new List());
  }

  getOperator = () => {
    if (!this.canDeleteCriterion()) return this.state.tempOperator;
    if (this.props.criterion.has('$nor')) return 'Out';
    return 'In';
  }

  changeCriterion = (operator, values) =>
    this.props.onCriterionChange(new Map({
      $comment: this.props.criterion.get('$comment'),
    }).merge(this.getCriterionQuery(operator, values)))

  changeValues = (values) => {
    const canDeleteCriterion = values.size === 0 && this.canDeleteCriterion();
    if (canDeleteCriterion) {
      return this.props.onDeleteCriterion();
    }
    return this.changeCriterion(this.getOperator(), values);
  }

  onAddOption = (model) => {
    if (!model.isEmpty()) {
      const values = this.getValues();
      const newValue = this.getOptionQuery(model);
      this.changeValues(values.push(newValue));
    }
  }

  onRemoveOption = (model) => {
    const values = this.getValues();
    const newValue = this.getOptionQuery(model);

    this.changeValues(
      values.filter(value => !value.equals(newValue))
    );
  }

  changeOperator = (operator) => {
    if (!this.canDeleteCriterion()) {
      return this.setState({ tempOperator: operator });
    }
    return this.changeCriterion(operator, this.getValues());
  }

  renderOption = ({ option, key }) => (
    <div key={key}>{option}</div>
  )

  render = () => {
    const styles = require('../styles.css');

    const criterionClasses = classNames(
      styles.criterionValue,
      { [styles.noCriteria]: !this.canDeleteCriterion() }
    );

    return (
      <div className={styles.criterion}>
        <div className={styles.criterionOperator}>
          <Operator
            operators={new Set(['In', 'Out'])}
            operator={this.getOperator()}
            onOperatorChange={this.changeOperator} />
        </div>
        <div className={criterionClasses} >
          {this.getValues().map(this.getQueryOption).map((option, i) => {
            return (
              <div key={i}>
                "{this.getOptionDisplay(option)}" tooltip({this.getOptionIdentifier(option)})
                <button onClick={() => this.onRemoveOption(option)}> remove</button>
              </div>
            );
          })}
          <TextInputGroup
            onSubmit={x => this.onAddOption(new Map(x))}
            onCancel={x => {console.log('---onCancel---'); console.log(x);}}
            fields={['value']}
            defaultValues={[]} />
        </div>
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  const path = ownProps.section.get('keyPath');
  const filter = new Map({ path: new Map({ $eq: path.join('.') }) });
  return { schema: 'querybuildercachevalue', filter };
}, {})(Criterion);
