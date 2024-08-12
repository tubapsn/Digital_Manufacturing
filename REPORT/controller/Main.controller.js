sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "REPORT/model/formatter",
    "common/transactionCaller",
    "sap/ui/core/Core",
    "sap/m/MessagePopover",
    "REPORT/scripts/Utility",
    "sap/ui/Device",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    MessageBox,
    Fragment,
    formatter,
    TransactionCaller,
    Core,
    MessagePopover,
    Utility,
    Device
  ) {
    "use strict";
    let tempData = [];
    let index = 0;
    return Controller.extend("REPORT.controller.Main", {
      onInit: function () {
       

       

        var oModel = new JSONModel(

          {
            "selectedKey": "root1",
            "navigation": [
              {
                "title": "Raporlar",
                "icon": "sap-icon://employee",
                "expanded": true,
                "key": "page1",
                "items": [
                  {
                    "title": "Aktive Raporu",
                    "key": "page1"
                  },
                  {
                    "title": "Aktive Ekleme",
                    "key": "page2"
                  },
                  {
                    "title": "Duruş Raporu",
                    "key": "page3"
                  },
                  {
                    "title": "Aktif Çalışmalar",
                    "key": "page4"
                  },
                ]
              }
            ],
            // "fixedNavigation": [
            //   {
            //     "title": "Fixed Item 1",
            //     "icon": "sap-icon://employee"
            //   },
            //   {
            //     "title": "Fixed Item 2",
            //     "icon": "sap-icon://building"
            //   },
            //   {
            //     "title": "Fixed Item 3",
            //     "icon": "sap-icon://card"
            //   }
            // ],
            "headerItems": [
              {
                "text": "File"
              },
              {
                "text": "Edit"
              },
              {
                "text": "View"
              },
              {
                "text": "Settings"
              },
              {
                "text": "Help"
              }
            ]
          }


        );
        this.getView().setModel(oModel);
        this._setToggleButtonTooltip(!Device.system.desktop);
      
      },                                          
      _setToggleButtonTooltip: function (bLarge) {
        var oToggleButton = this.byId('sideNavigationToggleButton');
        if (bLarge) {
          oToggleButton.setTooltip('Large Size Navigation');
        } else {
          oToggleButton.setTooltip('Small Size Navigation');
        }
      },
      onSideNavButtonPress: function () {
        var oToolPage = this.byId("toolPage");
        var bSideExpanded = oToolPage.getSideExpanded();
  
        this._setToggleButtonTooltip(bSideExpanded);
  
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      }, 
      onItemSelect: function (oEvent) {
        var oItem = oEvent.getParameter("item");
        this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));
      },

      
    });
  }
);
