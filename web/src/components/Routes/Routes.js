'use strict';

import App from '../../layouts/App';
import CommonMixin from '../../mixins/CommonMixin';
import NotFound from '../../pages/NotFound/NotFound';
import Auth from '../../pages/Auth/Auth';
import FormEdit from '../../pages/form/FormEdit/FormEdit';
import FormDetail from '../../pages/form/FormDetail/FormDetail';
import FormList from '../../pages/list/FormList/FormList';
import RegisterSuccess from '../../pages/result/RegisterSuccess/RegisterSuccess';
import Attention from '../../pages/result/Attention/Attention';

const {React, Component, PropTypes, Router, Route, IndexRedirect, connect, reactMixin} = window._external;

@reactMixin.decorate(CommonMixin)
class Routes extends Component {

    static history = null;

    static replace(config) {
        const {history} = Routes;
        history && history.replace(config);
    }

    static goBack() {
        const {history} = Routes;
        history && history.goBack();
    }

    static goto(config) {
        const {history} = Routes;
        history && history.push(config);
    }

    init() {
        const {history} = this.props;
        Routes.history = history;
    }

    destroy() {
        Routes.history = null;
    }

    render() {
        const {history} = this.props;
        return (
            <Router history={history}>
                <Route path="/" component={App}>
                    <IndexRedirect to="auth"/>
                    <Route path="auth" component={Auth}/>
                    <Route path="form/add" component={FormEdit}/>
                    <Route path="form/view" component={FormDetail}/>
                    <Route path="list/formList" component={FormList}/>
                    <Route path="result/registerSuccess" component={RegisterSuccess}/>
                    <Route path="result/attention" component={Attention}/>
                    <Route path="*" component={NotFound}/>
                </Route>
            </Router>
        );
    }
}

Routes.propTypes = {
    history: PropTypes.object.isRequired
};

export {Routes};

export default connect(state => ({}))(Routes);
