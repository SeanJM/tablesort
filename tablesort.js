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
      var table              = $(this.element)
      var tableSortContainer = $('<div class="table-sort-container"></div>');
      this.setup(table,tableSortContainer);
      this.search(table,tableSortContainer);
      this.count(table,tableSortContainer);
    },

    setup: function(table,tableSortContainer) {
      var scroll             = $('<div class="scrollbar-chrome"></div>');
      var scrollbar          = $('<div class="scrollbar-container"><div class="scrollbar"></div></div>');
      var scrolltrack        = $('<div class="scrollbar-track"></div>');
      var tableParent        = table.parent();
      var scrollbarWidth;
      var oldScroll;
      var scrollPos;

      // Make TH tags not selectable
      function userSelect(el,attr) {
        arr = ['webkit','moz','ms'];
        for (var i=0;i<arr.length;i++) {
          el.css('-'+arr[i]+'-user-select',attr);
        };
        el.css('user-select',attr);
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

        userSelect(th,'none');
        userSelect(sortField,'none');
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
          var sortArr     = [];
          var rowArr      = {};
          var obj         = {};
          var index       = $(this).index();
          var tr          = (table.hasClass('table-sort-search')) ? table.find('tbody tr:gt(0)') : table.find('tbody tr');
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
            var text     = $(this).find('td:eq('+index+')').text()+'_'+$(this).index();
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
      function styleToJson(el) {
        return JSON.parse('{'+el.attr('style').replace(/;/g,',').replace(/,$/,'').replace(/(|-)\d+(%|px)|(|-)\d+\.\d+(px|%|)|\w+/g,function (m) {return '"'+m+'"'})+'}');
      }
      /* When the user initiates the scrolling */
      function scrollActive(scrollPos) {
        var scrolltrackWidth        = scrolltrack.width();
        var scrollbarTravel         = scrolltrackWidth-scrollbar.width();
        var tableWidth              = table.width();
        var tableSortContainerWidth = tableSortContainer.width();
        var scrollPercentage        = scrollPos/scrollbarTravel;
        var scrollbarPercentage     = ((scrollbarTravel/scrolltrackWidth*scrollPercentage)*100);
        var tablePercentage         = ((tableWidth/tableSortContainerWidth-1)*100)*scrollPercentage;

        table.css('left',(tablePercentage*-1)+'%');
        scrollbar.css('left',scrollbarPercentage+'%');
      }
      /* When the user causes changes to viewport scale which affect scrolling */
      function scrollPassive() {
        var scrollbarStyles = styleToJson(scrollbar);
        var tableStyles     = styleToJson(table);

        if ((parseFloat(scrollbarStyles.left)+parseFloat(scrollbarStyles.width)) > 100) {
          var left            = (parseFloat(scrollbarStyles.left)+parseFloat(scrollbarStyles.width))-100;
          var percentage      = (parseFloat(scrollbarStyles.left)-left);

          scrollActive(Math.round((percentage*scrolltrack.width())/100));
        } else {
          var percentage = parseFloat((parseFloat(scrollbarStyles.left)*scrolltrack.width())/100);
          if (!isNaN(percentage)) scrollActive(Math.round(percentage));
        }
      }

      function setUpScroll() {
        var tableWidth  = table.width();
        var parentWidth = tableParent.width();
        var initPos,initMousePos,newMousePos,scrollPos;

        function wrapTable() {
          /* Puts the table into the tableSortContainer */
          tableSortContainer
            .insertBefore(table)
            .css('width',parentWidth+'px')
            .css('overflow','hidden')
            .css('position','relative');
          table.appendTo(tableSortContainer);
        }

        function scrollWidth() {
          var tableWidth  = table.width();
          var parentWidth = tableParent.width();
          scrollbar.css('width',(parentWidth/tableWidth*100)+'%');
        }

        function scrollEvent() {
          scrollbar.off('mousedown');
          scrolltrack.on('mousedown',function (e) {
            initPos      = scrollbar.offset().left-scrolltrack.offset().left;
            initMousePos = e.pageX-scrolltrack.offset().left;
            scroll.addClass('scrollbar-active');
            $('html').on('mousemove',function (e) {
              var scrollbarWidth   = scrollbar.width();
              var scrolltrackWidth = scrolltrack.width();
              newMousePos          = e.pageX-scrolltrack.offset().left;
              scrollPos            = newMousePos-initMousePos+initPos;
              if (scrollPos < 0) scrollPos = 0;
              if (scrollPos+scrollbarWidth > scrolltrackWidth) scrollPos = scrolltrackWidth-scrollbarWidth;
              scrollActive(scrollPos);
            });
            userSelect(tableSortContainer,'none');
          });
          $('html').off('mouseup');
          $('html').on('mouseup',function () {
            $('html').off('mousemove');
            scroll.removeClass('scrollbar-active');
            /* Store Old Scroll Value */
            userSelect(tableSortContainer,'');
          });
        }

        /* Build the scrollbar */
        function scrollBuild() {
          scrolltrack.append(scrollbar);
          scroll.append(scrolltrack);
          tableSortContainer.append(scroll);
          scroll.css('position','relative');
        }

        function initScroll() {
          var tableWidth  = table.width();
          var parentWidth = tableParent.width();

          function initTrue() {
            var initiated = (tableSortContainer.find('.scrollbar-chrome').size() < 1);

            if (initiated) {
              scrollBuild();
              table.css('width',tableWidth+'px');
              scrolltrack.css('position','relative');
              scrollbar.css('position','absolute');
              scrollEvent();
            } else if (!scroll.is(':visible')) {
              scroll.show();
            }

            table.css('position','relative');
            scrollWidth();
            scrollPassive();
          }

          function initFalse() {
            scroll.hide();
            table.css('width','100%').css('position','static');
          }

          if (tableWidth > parentWidth) {
            initTrue();
          } else {
            initFalse();
          }
        }

        wrapTable();
        initScroll();

        $(window).on('resize',function () {
          var oldTableContainerWidth = tableSortContainer.css('width');
          var newTableContainerWidth = tableSortContainer.parent().width();
          var oldScrollWidth         = scrollbar.attr('style');
          tableSortContainer.css('width',newTableContainerWidth+'px');
          initScroll();
        });
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

    search: function (table, tableSortContainer) {
      count = this.count; // Protect the namespace of this.count
      // Add highlighting around matched text
      function filter(options) {
        var tr    = options.table.find('tbody tr:gt(0)');
        var match = new RegExp(options.searchTerm,'ig');
        tr.each(function () {
          var el = $(this);
          var matchText = el.text().replace(/\n\s+/g,' ');
          el.find('.table-sort-highlight').contents().unwrap().end().remove();
          // Using match instead of test gets around a bug in Firefox
          if (matchText.match(match) !== null) {
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
          count(table,tableSortContainer);
        });
      }
    },
    count: function (table,tableSortContainer) {
      table = $(table);
      if (!table.hasClass('table-sort-show-search-count')) return false;
      var tr              = table.find('tbody tr:gt(0)');
      var total           = tr.filter(':visible').size();
      var searchContainer = tableSortContainer.find('.table-sort-search-container');
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