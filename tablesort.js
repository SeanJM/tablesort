// Thanks to http://jqueryboilerplate.com/ for providing a boiler plate. and
// thanks to http://www.reddit.com/user/maktouch for recommending the jQuery
// boiler plate.
// This code is licensed under the MIT liscence

;(function ( $, window, document, undefined ) {
  // Create the defaults once
  var pluginName = "tablesort",
  defaults = {
    search: true,
    count: true
  };

  // The actual plugin constructor
  function Plugin( element, options ) {
    this.element = element;
    this.options = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  Plugin.prototype = {

    init: function() {
      this.search(this.element,this.options);
      this.scanTh(this.element,this.options);
      this.count(this.element);
    },

    scanTh: function(table, options) {
      table = $(table);
      // Make TH tags not selectable
      function userSelectNone(el) {
        arr = ['webkit','moz','ms'];
        for (var i=0;i<arr.length;i++) {
          el.css('-'+arr[i]+'-user-select','none');
        };
        el.css('user-select','none');
      };
      // Add the sorting buttons to the TH elements
      function format(th) {
        var sortField   = $('<div class="table-sort-field"></div>');
        var sortControl = $('<div class="table-sort-control"></div>');
        var sortUp      = $('<div class="table-sort-up"></div>');
        var sortDown    = $('<div class="table-sort-down"></div>');
        var thContents  = $(th).clone().html();

        sortField.html(thContents);
        sortUp.appendTo(sortControl);
        sortDown.appendTo(sortControl);
        sortControl.appendTo(sortField);
        th.contents().replaceWith(sortField).end();

        userSelectNone(th);
      };
      // Generate a new clean row based on an array
      function newRow(arr) {
        var row = $('<tr></tr>');
        for (var i=0;i<arr.length;i++) {
          row.append('<td>'+arr[i]+'</td>');
        };
        return row;
      };
      // Create a new array of table rows from the sorted array
      function newBody(arg) {
        var body = $('<div></div>');
        for (var i=0;i<arg.sortArr.length;i++) {
          var tr = newRow(arg.rowArr[arg.sortArr[i]]);
          body.append(tr);
        };
        arg.tr.remove();
        arg.table.find('tbody').append(body.children());
      };
      // Remove the sort order class from the non active table headings
      function removeSortOrderClass(table) {
        table.find('th').each(function () {
          $(this).removeClass('table-sort-order-asc');
          $(this).removeClass('table-sort-order-des');
        });
      };
      // Go through each table heading and apply sorting if the heading is sortable
      table.find('th.table-sort').each(function () {
        var th = $(this);
        format(th);
        th.on('click',function () {
          var sortArr = [];
          var rowArr  = {};
          var obj     = {};
          var index   = $(this).index();
          var tr      = (table.hasClass('table-sort-search')) ? table.find('tbody tr:gt(0)') : table.find('tbody tr');
          var sortOrder;

          // Determine Sort Order
          if ($(this).hasClass('table-sort-order-desc')) {
            sortOrder = 'asc';
          } else if ($(this).hasClass('table-sort-order-asc')) {
            sortOrder = 'des';
          } else {
            sortOrder = 'asc';
          }
          tr.each(function () {
            var text     = $(this).find('td:eq('+index+')').text();
            rowArr[text] = [];
            sortArr.push(text);
            $(this).find('td').each(function () {
              rowArr[text].push($(this).html());
            });
          });
          // Sort Array and Apply Classes
          sortArr = sortArr.sort();
          if (sortOrder === 'asc') {
            sortArr = sortArr.reverse();
            $(this).removeClass('table-sort-order-des');
          } else {
            $(this).removeClass('table-sort-order-asc');
          }
          removeSortOrderClass(table);
          $(this).addClass('table-sort-order-'+sortOrder);

          newBody({
            table: table,
            tr: tr,
            sortArr: sortArr,
            rowArr: rowArr
          });
        });
      });
    },

    search: function (table, options) {
      count = this.count; // Protect the namespace of this.count
      // Add highlighting around matched text
      function filter(options) {
        var tr    = options.table.find('tbody tr:gt(0)');
        var match = new RegExp(options.searchTerm,'ig');
        tr.each(function () {
          var el = $(this);
          el.find('.table-sort-highlight').contents().unwrap().end().remove();
          if (match.test(el.text())) {
            el.find(':not(:has(*))').each(function () {
              var target = $(this);
              replaced   = target.html().replace(match,function (m,e) {
                return '<span class="table-sort-highlight">'+m+'</span>';
              });
              target.html(replaced);
            });
            el.show();
          } else {
            el.hide();
          }
        });
      }
      table = $(table);
      if (table.hasClass('table-sort-search')) {
        var colspan     = table.find('thead th').size();
        var search      = $('<tr><td class="table-sort-search-container" colspan='+colspan+'></td></tr>');
        var searchInput = $('<input class="table-sort-search-input" type="text" placeholder="Search...">');
        search.find('td').append(searchInput);
        table.find('tbody').prepend(search);

        searchInput.on('keyup',function () {
          filter({table: table,searchTerm: $(this).val()});
          count(table);
        });
      }
    },
    count: function (table, options) {
      table = $(table);
      if (!table.hasClass('table-sort-show-search-count')) return false;
      var tr              = table.find('tbody tr:gt(0)');
      var total           = tr.filter(':visible').size();
      var searchContainer = table.find('.table-sort-search-container');
      var countBadge      = searchContainer.find('.table-sort-search-count');

      if (countBadge.size() < 1) {
        countBadge =  $('<div class="table-sort-search-count"></div>');
        countBadge.appendTo(searchContainer);
      }
      countBadge.html(total);
    }
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin( this, options ));
      }
    });
  };

})( jQuery, window, document );