'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _events = require('./helpers/events');

var _find = require('./helpers/find');

var _find2 = _interopRequireDefault(_find);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var stickyOwnProps = ['mode', 'onFixedToggle', 'stickyStyle', 'stickyClassName', 'boundaryElement', 'scrollElement', 'bottomOffset', 'topOffset', 'positionRecheckInterval', 'noExceptionOnMissedScrollElement', 'wrapperCmp', 'holderCmp', 'hideOnBoundaryHit', 'holderProps'];

var isEqual = function isEqual(obj1, obj2) {
  for (var field in obj1) {
    if (obj1.hasOwnProperty(field) && obj1[field] !== obj2[field]) {
      return false;
    }
  }

  return true;
};

var Sticky = function (_Component) {
  _inherits(Sticky, _Component);

  function Sticky(props) {
    _classCallCheck(this, Sticky);

    var _this = _possibleConstructorReturn(this, (Sticky.__proto__ || Object.getPrototypeOf(Sticky)).call(this, props));

    _this.createWrapperRef = function (wrapper) {
      _this.wrapperEl = wrapper;
    };

    _this.createHolderRef = function (holder) {
      _this.holderEl = holder;
    };

    _this.checkPosition = function () {
      var holderEl = _this.holderEl,
          wrapperEl = _this.wrapperEl,
          boundaryElement = _this.boundaryElement,
          scrollElement = _this.scrollElement;
      var _this$props = _this.props,
          mode = _this$props.mode,
          onFixedToggle = _this$props.onFixedToggle;

      var holderRect = holderEl.getBoundingClientRect();
      var wrapperRect = wrapperEl.getBoundingClientRect();
      var boundaryRect = boundaryElement ? getRect(boundaryElement) : { top: -Infinity, bottom: Infinity };
      var scrollRect = getRect(scrollElement);
      var fixed = _this.isFixed(holderRect, wrapperRect, boundaryRect, scrollRect);

      var newState = {
        fixed: fixed,
        boundaryTop: mode === 'bottom' ? boundaryRect.top : 0,
        boundaryBottom: mode === 'top' ? boundaryRect.bottom : 0,
        top: mode === 'top' ? scrollRect.top : 0,
        bottom: mode === 'bottom' ? scrollRect.bottom : 0,
        width: holderRect.width,
        height: wrapperRect.height
      };

      if (fixed !== _this.state.fixed && onFixedToggle && typeof onFixedToggle === 'function') {
        onFixedToggle(_this.state.fixed);
      }

      if (!isEqual(_this.state, newState)) {
        _this.setState(function () {
          return newState;
        });
      }
    };

    _this.state = {
      height: 0,
      fixed: false
    };
    return _this;
  }

  _createClass(Sticky, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var me = _reactDom2.default.findDOMNode(this);
      var _props = this.props,
          boundaryElement = _props.boundaryElement,
          scrollElement = _props.scrollElement,
          noExceptionOnMissedScrollElement = _props.noExceptionOnMissedScrollElement,
          positionRecheckInterval = _props.positionRecheckInterval;


      this.boundaryElement = (0, _find2.default)(boundaryElement, me);
      if (this.boundaryElement === window || this.boundaryElement === document) {
        // such objects can't be used as boundary
        // and in fact there is no point in such a case
        this.boundaryElement = null;
      }

      this.scrollElement = (0, _find2.default)(scrollElement, me);

      if (this.scrollElement) {
        (0, _events.listen)(this.scrollElement, ['scroll'], this.checkPosition);
      } else if (!noExceptionOnMissedScrollElement) {
        throw new Error('Cannot find scrollElement ' + scrollElement);
      }

      (0, _events.listen)(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
      this.checkPosition();

      if (positionRecheckInterval) {
        this.checkPositionIntervalId = setInterval(this.checkPosition, positionRecheckInterval);
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this.scrollElement) {
        (0, _events.unlisten)(this.scrollElement, ['scroll'], this.checkPosition);
      }
      (0, _events.unlisten)(window, ['scroll', 'resize', 'pageshow', 'load'], this.checkPosition);
      this.boundaryElement = null;
      this.scrollElement = null;
      clearTimeout(this.checkPositionIntervalId);
    }
  }, {
    key: 'isFixed',
    value: function isFixed(holderRect, wrapperRect, boundaryRect, scrollRect) {
      var _props2 = this.props,
          hideOnBoundaryHit = _props2.hideOnBoundaryHit,
          bottomOffset = _props2.bottomOffset,
          topOffset = _props2.topOffset,
          mode = _props2.mode;


      if (boundaryRect && !instersect(boundaryRect, scrollRect, topOffset, bottomOffset)) {
        return false;
      }

      var hideOffset = hideOnBoundaryHit ? wrapperRect.height + bottomOffset : 0;

      if (mode === 'top') {
        return holderRect.top + topOffset < scrollRect.top && scrollRect.top + hideOffset <= boundaryRect.bottom;
      }

      return holderRect.bottom - topOffset > scrollRect.bottom && scrollRect.bottom - hideOffset >= boundaryRect.top;
    }
  }, {
    key: 'buildTopStyles',
    value: function buildTopStyles() {
      var _props3 = this.props,
          bottomOffset = _props3.bottomOffset,
          hideOnBoundaryHit = _props3.hideOnBoundaryHit;
      var _state = this.state,
          top = _state.top,
          height = _state.height,
          boundaryBottom = _state.boundaryBottom;


      if (hideOnBoundaryHit || top + height + bottomOffset < boundaryBottom) {
        return { top: top, position: 'fixed' };
      }

      return { bottom: bottomOffset, position: 'absolute' };
    }
  }, {
    key: 'buildBottomStyles',
    value: function buildBottomStyles() {
      var _props4 = this.props,
          bottomOffset = _props4.bottomOffset,
          hideOnBoundaryHit = _props4.hideOnBoundaryHit;
      var _state2 = this.state,
          bottom = _state2.bottom,
          height = _state2.height,
          boundaryTop = _state2.boundaryTop;


      if (hideOnBoundaryHit || bottom - height - bottomOffset > boundaryTop) {
        return { top: bottom - height, position: 'fixed' };
      }

      return { top: bottomOffset, position: 'absolute' };
    }
  }, {
    key: 'buildStickyStyle',
    value: function buildStickyStyle() {
      var style = void 0;
      if (this.props.mode === 'top') {
        style = this.buildTopStyles();
      } else {
        style = this.buildBottomStyles();
      }
      style.width = this.state.width;

      return style;
    }
  }, {
    key: 'render',
    value: function render() {
      var props = this.props;
      var _state3 = this.state,
          fixed = _state3.fixed,
          height = _state3.height;
      var stickyClassName = props.stickyClassName,
          stickyStyle = props.stickyStyle,
          holderCmp = props.holderCmp,
          wrapperCmp = props.wrapperCmp,
          holderProps = props.holderProps,
          children = props.children;

      var wrapperProps = sanitizeProps(props, stickyOwnProps);
      // To ensure that this component becomes sticky immediately on mobile devices instead
      // of disappearing until the scroll event completes, we add `transform: translateZ(0)`
      // to 'kick' rendering of this element to the GPU
      // @see http://stackoverflow.com/questions/32875046
      var wrapperStyle = { transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' };
      if (wrapperProps.style) {
        wrapperStyle = _extends({}, wrapperStyle, wrapperProps.style);
      }

      if (fixed) {
        wrapperProps.className += ' ' + stickyClassName;
        wrapperStyle = _extends({}, wrapperStyle, stickyStyle, this.buildStickyStyle());
      }

      holderProps.style = _extends({}, holderProps.style, { minHeight: height + 'px' });
      if (typeof holderCmp === 'string') {
        holderProps.ref = this.createHolderRef;
      } else {
        holderProps.holderRef = this.createHolderRef;
      }

      wrapperProps.style = wrapperStyle;
      if (typeof wrapperCmp === 'string') {
        wrapperProps.ref = this.createWrapperRef;
      } else {
        wrapperProps.wrapperRef = this.createWrapperRef;
      }

      return _react2.default.createElement(holderCmp, holderProps, _react2.default.createElement(wrapperCmp, wrapperProps, children));
    }
  }]);

  return Sticky;
}(_react.Component);

// some helpers

Sticky.propTypes = {
  mode: _propTypes2.default.oneOf(['top', 'bottom']),
  onFixedToggle: _propTypes2.default.func,
  stickyStyle: _propTypes2.default.object,
  stickyClassName: _propTypes2.default.string,
  hideOnBoundaryHit: _propTypes2.default.bool,
  boundaryElement: _propTypes2.default.string,
  scrollElement: _propTypes2.default.string,
  bottomOffset: _propTypes2.default.number,
  topOffset: _propTypes2.default.number,
  positionRecheckInterval: _propTypes2.default.number,
  noExceptionOnMissedScrollElement: _propTypes2.default.bool,
  wrapperCmp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  holderCmp: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.func]),
  holderProps: _propTypes2.default.object
};
Sticky.defaultProps = {
  className: '',
  style: {},
  mode: 'top',
  holderCmp: 'div',
  holderProps: {},
  wrapperCmp: 'div',
  stickyClassName: 'sticky',
  stickyStyle: null,
  hideOnBoundaryHit: true,
  boundaryElement: null,
  scrollElement: 'window',
  topOffset: 0,
  bottomOffset: 0,
  noExceptionOnMissedScrollElement: false,
  positionRecheckInterval: 0
};
exports.default = Sticky;
function getRect(el) {
  if (el && typeof el.getBoundingClientRect === 'function') {
    return el.getBoundingClientRect();
  }

  if (el === window || el === document) {
    return { top: 0, left: 0, bottom: window.innerHeight, height: window.innerHeight, width: window.innerWidth, right: window.innerWidth };
  }

  return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 };
}

function instersect(r1, r2, topOffset, bottomOffset) {
  var r1Top = r1.top + topOffset,
      r1Bottom = r1.bottom + bottomOffset;

  return r1Top >= r2.top && r1Top <= r2.bottom || r1Bottom >= r2.top && r1Bottom <= r2.bottom || r1Bottom >= r2.bottom && r1Top <= r2.top;
}

/**
 * Simply removes all unwanted props in order to avoid react 'unkown prop' warning
 * @param  {Object} props     that should be sanitized
 * @param  {Object} toRemove  array of prop names to remove
 * @return {Object}           cloned and sanitized props
 */
function sanitizeProps(props, toRemove) {
  props = _extends({}, props);
  for (var i = 0, l = toRemove.length; i < l; i += 1) {
    delete props[toRemove[i]];
  }
  return props;
}
module.exports = exports['default'];