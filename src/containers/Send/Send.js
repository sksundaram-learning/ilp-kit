import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import DocumentMeta from 'react-document-meta';
import * as sendActions from 'redux/modules/send';
import config from '../../config';

import { SendForm } from 'components';

@connect(
  state => ({
    send: state.send,
    success: state.send.success,
    fail: state.send.fail
  }),
  sendActions)

export default class Send extends Component {

  static propTypes = {
    transfer: PropTypes.func,
    unmount: PropTypes.func,
    success: PropTypes.bool,
    fail: PropTypes.string
  }

  render() {
    const {success, fail, transfer, unmount} = this.props;

    return (
      <div className="container">
        <h1>Send</h1>
        <DocumentMeta title={config.app.title + ': Send'} />

        <SendForm transfer={transfer} unmount={unmount} success={success} fail={fail} />
      </div>
    );
  }
}
