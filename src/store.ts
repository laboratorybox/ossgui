import { createStore, Store } from '@reduxjs/toolkit'
import rootReducer, { RootAction, RootState } from './reducers'

type DispatchType = (args: RootAction) => RootAction

const store: Store<RootState, RootAction> & {dispatch: DispatchType} = createStore(rootReducer, {})

export default store