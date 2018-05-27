"use strict";

import React from 'react';
import { connect } from "react-redux";
import classNames from 'classnames';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import AvTime from '@material-ui/icons/AvTimer'
import FilterListIcon from '@material-ui/icons/FilterList';
import { lighten } from '@material-ui/core/styles/colorManipulator';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { bindActionCreators } from "redux";
import {clockOut, deleteItem} from '../../actions/fetchingActions';
import ClockOutPopup from './clockOutPopup';


const columnData = [
    { id: 'caregiverName', numeric: false, disablePadding: false, label: 'Staff' },
    { id: 'clientName', numeric: false, disablePadding: false, label: 'Client' },
    { id: 'clockInTime', numeric: false, disablePadding: false, label: 'Clock in time' },
    { id: 'duration', numeric: false, disablePadding: false, label: 'Duration' },
];

class EnhancedTableHead extends React.Component {
    createSortHandler = property => event => {
      this.props.onRequestSort(event, property);
    };
  
    render() {
      const { onSelectAllClick, order, orderBy, numSelected, rowCount } = this.props;
  
      return (
        <TableHead>
          <TableRow>

            {columnData.map(column => {
              return (
                <TableCell
                  key={column.id}
                  numeric={column.numeric}
                  padding={column.disablePadding ? 'none' : 'default'}
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <Tooltip
                    title="Sort"
                    placement={column.numeric ? 'bottom-end' : 'bottom-start'}
                    enterDelay={300}
                  >
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={order}
                      onClick={this.createSortHandler(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  </Tooltip>
                </TableCell>
              );
            }, this)}
          </TableRow>
        </TableHead>
      );
    }
  }
  
  EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
  };



const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
    overflow:'scroll',
    height: '46%'
  },
  table: {
    minWidth: 700,
  }
});


class RealtimeTable extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            order: 'asc',
            orderBy: 'duration',
            selected: [],
            page: 0,
            rowsPerPage: 5,
            open:false,
            selectedVisit:null
        }
        this.sortItems = this.sortItems.bind(this);
    }

    handleRequestSort = (event, property) => {
        const orderBy = property;
        let order = 'desc';
    
        if (this.state.orderBy === property && this.state.order === 'desc') {
          order = 'asc';
        }
        this.setState({order, orderBy });
    };

    handleSelectAllClick = (event, checked) => {
        if (checked) {
          this.setState({ selected: this.props.confirmed.map(visit => visit.visitId) });
          return;
        }
        this.setState({ selected: [] });
    };

    handleClick = (event, id) => {
        const { selected } = this.state;
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
    
        if (selectedIndex === -1) {
          newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
          newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
          newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
          newSelected = newSelected.concat(
            selected.slice(0, selectedIndex),
            selected.slice(selectedIndex + 1),
          );
        }
    
        this.setState({ selected: newSelected });
    };
    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };
    
    isSelected = (id) => {
        return this.state.selected.indexOf(id) !== -1;
    }


    sortItems = () => { 
        var orderProp = this.state.orderBy;
        if(orderProp == 'duration'){
            orderProp = 'clockInTime';
        }
        var asc = (this.state.order == 'asc')

        return this.props.confirmed.sort(function(a,b){return (a[orderProp] > b[orderProp] ) ? asc : ((b[orderProp]  > a[orderProp] ) ? !asc : 0);});
    }

    filter = () => {
        console.log('here is the filter');
    }

    clockOutItems = () => {
        this.props.clockOut(this.state.selected);
        this.setState({ selected:[]});
    }

    deleteItem = () => {
        this.props.deleteItem(this.state.selected);
        this.setState({ selected:[]});
    }

    handleClickOpen = (visit) => {
        this.setState({
          open: true,
          selectedVisit :visit
        });
      };
    
    handleClose = value => {
        this.setState({open: false });
    };

    render(){

        {/* <TableCell padding="checkbox">
                        <Tooltip title="Clock out">
                            <IconButton aria-label="calendar-clock" onClick={this.handleClickOpen.bind(this,visit)} className='clockOutIcon'>
                                <AvTime style={{color:'#f55845'}}/>
                            </IconButton>
                        </Tooltip>
        </TableCell> */}

        const { classes } = this.props;
        const { data, order, orderBy, selected, rowsPerPage, page } = this.state;
        const emptyRows = rowsPerPage - Math.min(rowsPerPage, this.props.confirmed.length - page * rowsPerPage);
        return (
            <Paper className={classes.root}>

            <div className={classes.tableWrapper}>
            <Table className={classes.table} aria-labelledby="tableTitle">
                <EnhancedTableHead
                    numSelected={selected.length}
                    order={order}
                    orderBy={orderBy}
                    onSelectAllClick={this.handleSelectAllClick}
                    onRequestSort={this.handleRequestSort}
                    rowCount={this.props.confirmed.length}
                />
                <TableBody>
                {this.sortItems().slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(visit => {
                    const isSelected = this.isSelected(visit.visitId+moment(visit.date).format('DDMMYYYY'));
                    var duration = (moment().diff(moment(visit.clockInTime),'hours',true));
                    var DurationHour = Math.floor(duration);
                    var durationDifference = Math.round((duration - DurationHour)*60);
                    return (
                    <TableRow 
                        key={visit.visitId+moment(visit.date).format('DDMMYYYY')}
                        hover
                        onClick={event => this.handleClick(event, visit.visitId+moment(visit.date).format('DDMMYYYY'))}
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                                    >

                        <TableCell component="th" scope="row"  style={{fontSize: 12}}>
                        {visit.caregiverName}
                        </TableCell>
                        <TableCell style={{fontSize: 12}}>{visit.clientName}</TableCell>
                        <TableCell style={{fontSize: 12}}>{visit.clockInTime? moment(visit.clockInTime).tz('America/St_Johns').format('h:mm a'): 'Not available'}</TableCell>
                        <TableCell style={{fontSize: 12}}> {DurationHour+':'+('0' + durationDifference).slice(-2)+' '}</TableCell>
                        
                
                    </TableRow>
                    );
                })}
                {emptyRows > 0 && (
                            <TableRow style={{ height: 45 * emptyRows }}>
                            <TableCell colSpan={6} />
                            </TableRow>
                )}
                </TableBody>
            </Table>
            </div>
            <TablePagination
                component="div"
                count={this.props.confirmed.length}
                classes={{root:'dashboardPagination'}}
                rowsPerPage={rowsPerPage}
                page={page}
                backIconButtonProps={{
                    'aria-label': 'Previous Page',
                }}
                nextIconButtonProps={{
                    'aria-label': 'Next Page',
                }}
                onChangePage={this.handleChangePage}
                onChangeRowsPerPage={this.handleChangeRowsPerPage}
            />
            <ClockOutPopup 
                open={this.state.open}
                onClose={this.handleClose}
                visit={this.state.selectedVisit}
            />
            </Paper>
        );
    }
}

RealtimeTable.propTypes = {
  classes: PropTypes.object.isRequired,
};

RealtimeTable.defaultProps = {
    confirmed: [],
};

function mapStateToProps(state) {
    return {confirmed: state.clientReducers.confirmed};
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({ 
      clockOut:clockOut,
      deleteItem:deleteItem
    }, dispatch);
  }

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(RealtimeTable));

