import * as React from 'react'
import { NavLink } from 'react-router-dom'

import { GradingOverview } from './gradingShape'

type GradingNavLinkProps = {
  data: GradingOverview
}

/**
 * Used to render a link in the table that displays GradingOverviews.
 * This is a fully fledged component (not SFC) by specification in
 * ag-grid.
 *
 * See {@link https://www.ag-grid.com/example-react-dynamic}
 */
class GradingNavLink extends React.Component<GradingNavLinkProps, {}> {
  constructor(props: GradingNavLinkProps) {
    super(props)
  }

  public render() {
    return (
      <NavLink to={`/academy/grading/${this.props.data.submissionId}`} activeClassName="pt-active">
        {'Add comments'}
      </NavLink>
    )
  }
}

export default GradingNavLink