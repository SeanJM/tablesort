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
    this.element   = element;
    this.options   = $.extend( {}, defaults, options );
    this._defaults = defaults;
    this._name     = pluginName;

    this.init();
  }

  Plugin.prototype = {

    init: function() {
      var table = $(this.element)
      this.setup(table);
      this.search(table);
      this.count(table);
    },

    setup: function(table) {
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
          var td = $('<td>'+arr[i]+'</td>').css('white-space','nowrap');
          row.append(td);
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
      function bindTh(th) {
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
      }
      function setUpScroll() {
        var width              = table.width();
        var parentWidth        = table.parent().width();
        var tableSortContainer = $('<div class="table-sort-container"></div>');
        var scroll             = $('<div class="scrollbar-chrome"><div class="scrollbar-track"><div class="scrollbar-container"><div class="scrollbar"></div></div></div></div>');
        var scrollbar          = scroll.find('.scrollbar-container');
        var scrolltrack        = scroll.find('.scrollbar-track');
        var scrollbarWidth;

        function initScroll() {
          tableSortContainer.append(scroll);
          table.css('width',width+'px');
          scrolltrack.css('position','relative');
          scrollbar.css('position','absolute');

          // Determine the width of the scrollbar
          scrollbarWidth = parentWidth/width*scrolltrack.width();
          scrollbar.css('width',scrollbarWidth+'px');

          scrollbar.off('mousedown');
          scrolltrack.on('mousedown',function (e) {
            var initMousePost = e.pageX-scrolltrack.offset().left;
            console.log(initMousePost);
            scrolltrack.on('mousemove',function () {

            });
          });
          scrolltrack.off('mouseup');
          scrolltrack.on('mouseup',function () {
            scrolltrack.off('mousemove');
          });
        }

        tableSortContainer
          .insertBefore(table)
          .css('width',parentWidth+'px')
          .css('overflow','hidden')
          .css('position','relative');
        table.appendTo(tableSortContainer);

        if (width > parentWidth) {
          initScroll();
        }
      }
      // Go through each table heading and apply sorting if the heading is sortable
      table.find('th').each(function () {
        var th = $(this);
        th.css('white-space','nowrap');
        if ($(this).hasClass('table-sort')) {
          format(th);
          bindTh(th);
        }
      });
      table.find('td').each(function () {
        $(this).css('white-space','nowrap');
      });
      setUpScroll();
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
        var colspan       = table.find('thead th').size();
        var searchEmpty   = $('<tr><td class="table-sort-search-empty" colspan='+colspan+'></td></tr>');
        var search        = $('<div class="table-sort-search-container"><input class="table-sort-search-input" type="text" placeholder="Search..."></div>');
        var searchInput   = search.find('.table-sort-search-input');
        var tbody         = table.find('tbody');
        var tbodyPosition = tbody.position();

        search
          .css('position','absolute')
          .css('left',tbodyPosition.left)
          .css('top',tbodyPosition.top);

        tbody.prepend(searchEmpty);
        table.parent().append(search);

        // Make the empty cell the same height as the search element
        if (typeof search.css('height') === 'string') {
          searchEmpty.css('height',search.css('height'));
        }

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