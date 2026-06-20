import { RouterStore, syncHistoryWithStore } from '@ibm/mobx-react-router';
import { createBrowserHistory } from 'history';

export const routingStore = new RouterStore();

const browserHistory = createBrowserHistory();
export const history = syncHistoryWithStore(browserHistory, routingStore);
