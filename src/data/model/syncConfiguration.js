import { over } from "../helpers"

import compose from "crocks/helpers/compose"
import constant from "crocks/combinators/constant"
import equals from "crocks/pointfree/equals"
import getProp from "crocks/Maybe/getProp"
import map from "crocks/pointfree/map"
import mapProps from "crocks/helpers/mapProps"
import option from "crocks/pointfree/option"
import when from "crocks/logic/when"

export const updateActiveConfigTabs = ({ tabs, id }) =>
  over(
    "data",
    map(
      when(
        compose(
          equals(id),
          option(""),
          getProp("id")
        ),
        mapProps({
          tabs: constant(tabs)
        })
      )
    )
  )
