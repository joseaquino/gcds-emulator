import React from "react";

import pick from "crocks/helpers/pick";

import { connect } from "react-redux";

import "./SidebarNavigation.scss";
import { selectMenuItem, changeActivePane } from "../data/reducers/navigation";

const SidebarNavigation = ({ data, selectMenuItem }) => (
  <ul id="sidebar-nav">
    {data.map((item, idx) =>
      item.menu.visible ? (
        <li
          onClick={() => selectMenuItem(item.id)}
          className={item.menu.active ? "selected" : ""}
          key={idx}
        >
          {item.title}
        </li>
      ) : null
    )}
  </ul>
);

const mapProps = pick(["data"]);

const mapDispatch = dispatch => ({
  selectMenuItem: id => dispatch([selectMenuItem(id), changeActivePane()])
});

export default connect(
  mapProps,
  mapDispatch
)(SidebarNavigation);
