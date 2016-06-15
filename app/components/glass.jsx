
'use strict;' 
 import React, {Component} from 'react'; 


export const ToDoList = () => {
    return (
        <div className="row">
        <div className="col-xs-12 col-md-6 col-lg-3">

        <div className="panel panel-blue">
            <div className="panel-heading dark-overlay"><svg className="glyph stroked clipboard-with-paper">
                <use xlinkHref="#stroked-clipboard-with-paper"></use></svg>To-do List</div>
            <div className="panel-body">
                <ul className="todo-list">
                <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Make a plan for today</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil">
                            <use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                    <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Update Basecamp</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil"><use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                    <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Send email to Jane</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil"><use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                    <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Drink coffee</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil"><use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                    <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Do some work</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil"><use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                    <li className="todo-list-item">
                        <div className="checkbox">
                            <input type="checkbox" id="checkbox" />
                            <label for="checkbox">Tidy up workspace</label>
                        </div>
                        <div className="pull-right action-buttons">
                            <a href="#"><svg className="glyph stroked pencil"><use xlinkHref="#stroked-pencil"></use></svg></a>
                            <a href="#" className="flag"><svg className="glyph stroked flag"><use xlinkHref="#stroked-flag"></use></svg></a>
                            <a href="#" className="trash"><svg className="glyph stroked trash"><use xlinkHref="#stroked-trash"></use></svg></a>
                        </div>
                    </li>
                </ul>
            </div>
            <div className="panel-footer">
                <div className="input-group">
                    <input id="btn-input" type="text" className="form-control input-md" placeholder="Add new task" />
                    <span className="input-group-btn">
                        <button className="btn btn-primary btn-md" id="btn-todo">Add</button>
                    </span>
                </div>
            </div>
        </div>
        </div>
        </div>
    )
}


export const Glass = ({title}) => { 
    return ( 

        <div className="row">
			<div className="col-xs-12 col-md-6 col-lg-3">
				<div className="panel panel-blue panel-widget ">
					<div className="row no-padding">
						<div className="col-sm-3 col-lg-5 widget-left">
							<svg xmlns="http://www.w3.org/2000/svg" className="glyph stroked bag">
                                <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#stroked-bag" /></svg>
						</div>
						<div className="col-sm-9 col-lg-7 widget-right">
							<div className="large">120</div>
							<div className="text-muted">New Orders</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-xs-12 col-md-6 col-lg-3">
				<div className="panel panel-orange panel-widget">
					<div className="row no-padding">
						<div className="col-sm-3 col-lg-5 widget-left">
							<svg xmlns="http://www.w3.org/2000/svg" className="glyph stroked empty-message">
                            <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#stroked-empty-message" /></svg>
						</div>
						<div className="col-sm-9 col-lg-7 widget-right">
							<div className="large">52</div>
							<div className="text-muted">Comments</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-xs-12 col-md-6 col-lg-3">
				<div className="panel panel-teal panel-widget">
					<div className="row no-padding">
						<div className="col-sm-3 col-lg-5 widget-left">
							<svg xmlns="http://www.w3.org/2000/svg" className="glyph stroked male-user">
                            <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#stroked-male-user" /></svg>
						</div>
						<div className="col-sm-9 col-lg-7 widget-right">
							<div className="large">24</div>
							<div className="text-muted">New Users</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-xs-12 col-md-6 col-lg-3">
				<div className="panel panel-red panel-widget">
					<div className="row no-padding">
						<div className="col-sm-3 col-lg-5 widget-left">
							<svg xmlns="http://www.w3.org/2000/svg" className="glyph stroked app-window-with-content">
                            <use xmlnsXlink="http://www.w3.org/1999/xlink" xlinkHref="#stroked-app-window-with-content" /></svg>
						</div>
						<div className="col-sm-9 col-lg-7 widget-right">
							<div className="large">25.2k</div>
							<div className="text-muted">Page Views</div>
						</div>
					</div>
				</div>
			</div>
		</div>
    );
}