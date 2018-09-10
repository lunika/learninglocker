import React, { PropTypes } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import { updateModel } from 'ui/redux/modules/models';
import CountEditor from './CountEditor';
import BaseAxesEditor from './BaseAxesEditor';

export class StatementEditor extends BaseAxesEditor {
  static propTypes = {
    model: PropTypes.instanceOf(Map),
    updateModel: PropTypes.func
  };

  render = () => (
    <div className="form-group">
      <label htmlFor="toggleInput" className="clearfix" style={{ marginLeft: '3px', marginBottom: '20px'}}>Add your Column</label><br />
      yo yo
      <CountEditor
        type={this.props.model.get('type')}
        value={this.getAxesValue('value')}
        operator={this.getAxesValue('operator')}
        changeValue={this.changeAxes.bind(this, 'value')}
        changeOperator={this.changeAxes.bind(this, 'operator')} />
    </div>
  );
}

export default connect(() => ({}), { updateModel })(StatementEditor);