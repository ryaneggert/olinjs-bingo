// Miscellaneous functions
tools = {};
tools.capitalizeName = function(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

tools.hasBingo = function(arr) {
  return (check_rows(arr) ||
    check_cols(arr) ||
    check_diag_forw(arr) ||
    check_diag_back(arr));
};

var all_true = function(arr) {
  for (var elem in arr) {
    if (arr[elem] === false) {
      return false;
    }
  }
  return true;
};

var check_rows = function(arr) {
  for (var row in arr) {
    if (all_true(arr[row])) {
      return true;
    }
  }
  return false;
};

var check_cols = function(arr) {
  for (var i in arr) {
    var col = [];
    for (var j in arr) {
      col.push(arr[j][i]);
    }
    if (all_true(col)) {
      return true;
    }
  }
  return false;
};

var check_diag_forw = function(arr) {
  var diag = [];
  for (var i in arr) {
    diag.push(arr[i][i]);
  }
  return all_true(diag);
};

var check_diag_back = function(arr) {
  var diag = [];
  for (var i in arr) {
    diag.push(arr[i][arr.length - i - 1]);
  }
  return all_true(diag);
};


module.exports = tools;


// var testcase = [
//   [true, true, true, true, false],
//   [true, true, false, true, true],
//   [true, true, false, true, true],
//   [true, false, false, false, false],
//   [true, true, true, false, true]
// ];

// console.log(tools.hasBingo(testcase))