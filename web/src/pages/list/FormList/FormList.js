'use strict';

import {doAction} from '../../../redux/actions/Action';
import ActionTypes from '../../../redux/actions/ActionTypes';
import CommonMixin from '../../../mixins/CommonMixin';
import Util from '../../../utils/Util';

const {
    React, Component, PropTypes, connect, reactMixin, ActivityIndicator, Card, _, $, Link
} = window._external;

@reactMixin.decorate(CommonMixin)
class FormList extends Component {

    static pageSize = 10;
    static defaultState = {
        loading: false,
        finished: false,
        listData: [],
        currentPage: 0,
        pageType: 'myFormList'
    };

    pageTitle = '表单列表';

    getViewportHeight() {
        var prop = 'clientHeight',
            win = window,
            doc = win.document,
            body = doc.body,
            documentElement = doc.documentElement,
            documentElementProp = documentElement[prop];
        // 标准模式取 documentElement
        // backcompat 取 body
        return doc.compatMode === 'CSS1Compat'
            && documentElementProp ||
            body && body[prop] || documentElementProp;
    }

    renderList() {
        const {dispatch, loading, finished, currentPage, pageType} = this.props;
        if (loading || finished) {
            return;
        }
        const top = $('#loadingDiv').offset().top;
        const scrollTop = $(document).scrollTop();
        if (top - scrollTop < this.getViewportHeight()) {
            doAction(dispatch, ActionTypes.formList.getFormList, {
                pageType,
                currentPage: currentPage + 1,
                pageSize: FormList.pageSize
            });
        }
    }

    init() {
        const {pageType} = this.props;
        Util.later(() => {
            this.renderList();
        }, 1);
        $(window).on('scroll.FormList', Util.buffer(this.renderList).bind(this));
    }

    reset() {
        const {dispatch} = this.props;
        doAction(dispatch, ActionTypes.formList.replaceState, FormList.defaultState);
        $(window).off('scroll.FormList');
    }

    changeTab = (type) => {
        const {dispatch, loading, finished} = this.props;
        if (loading || finished) {
            return;
        }
        doAction(dispatch, ActionTypes.formList.changeList, {
            pageType: type,
            currentPage: 1,
            pageSize: this.pageSize
        });
    }

    render() {
        const {location, finished, listData, pageType} = this.props;

        const items = listData.map(row => {
            const {id, title, createTime} = row;

            return <Link
                key={id}
                to={{
                    pathname: '/form/view',
                    query: {formId: id}
                }}
            >
                <Card className="x-card">
                    <Card.Body>
                        <div>标题：{title}</div>
                    </Card.Body>
                </Card>
            </Link>
        })

        return (
            <div className="x-page">
                <div className="x-header">
                    <div className={'x-tab' + (pageType == 'myFormList' && ' x-tab-cur')} onClick={this.changeTab.bind(this, 'myFormList')}>
                        我发起的
                    </div>
                    <div className={'x-tab' + (pageType == 'getAttendedActivityList' && ' x-tab-cur')} onClick={this.changeTab.bind(this, 'getAttendedActivityList')}>
                        我参加的
                    </div>
                </div>
                <div className="x-list">
                    {items}
                    <div id="loadingDiv" className="x-margin-20-0">
                        {
                            finished ? <div className="x-noMore">没有更多了</div> :
                                <ActivityIndicator size="large" className="x-activity-indicator"/>
                        }
                    </div>
                </div>
            </div>
        );
    }

}

FormList.propTypes = {
    location: PropTypes.object.isRequired
};

export {FormList};

export default connect(state => state.formList)(FormList);
