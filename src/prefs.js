/*
Copyright (C) 2014  spin83

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, visit https://www.gnu.org/licenses/.
*/

const {Gdk, Gio, GLib, GObject, Gtk, Adw} = imports.gi;

const Gettext = imports.gettext.domain('multi-monitors-add-on');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const SHOW_INDICATOR_ID = 'show-indicator';
const SHOW_PANEL_ID = 'show-panel';
const SHOW_ACTIVITIES_ID = 'show-activities';
const SHOW_APP_MENU_ID = 'show-app-menu';
const SHOW_DATE_TIME_ID = 'show-date-time';
const THUMBNAILS_SLIDER_POSITION_ID = 'thumbnails-slider-position';
const AVAILABLE_INDICATORS_ID = 'available-indicators';
const TRANSFER_INDICATORS_ID = 'transfer-indicators';
const ENABLE_HOT_CORNERS = 'enable-hot-corners';

const Columns = {
    INDICATOR_NAME: 0,
    MONITOR_NUMBER: 1,
};

var MultiMonitorsPrefsWidget = GObject.registerClass(
    class MultiMonitorsPrefsWidget extends Gtk.Grid {
        _init() {
            super._init();

            this._numRows = 0;

            this.set_orientation(Gtk.Orientation.VERTICAL);

            this._settings = Convenience.getSettings();
            this._desktopSettings = Convenience.getSettings(
                'org.gnome.desktop.interface'
            );

            this._display = Gdk.Display.get_default();
            this._monitors = this._display.get_monitors();

            this._createUI();
        }

        /**
         * Adds a child widget to the grid
         *
         * @param {Gtk.Widget} child - The widget to add
         * @private
         */
        _addToGrid(child) {
            this.attach(child, 0, this._numRows++, 1, 1);
        }

        /**
         * Creates the UI elements
         *
         * @private
         */
        _createUI() {
            this._addSwitches();
            this._setupStore();
            this._createTreeview();
            this._setupTreeviewColumns();
            this._setupToolbar();
            this._connectSignals();
        }

        /**
         * Adds boolean switches for various settings
         *
         * @private
         */
        _addSwitches() {
            /**
             * @typedef {object} switchConfig
             * @property {string} label - Label for the switch
             * @property {string} settingId - Setting ID
             * @property {{none: string, right: string, left: string, auto: string}} [options={}] - Options for the combobox
             * @property {Gio.Settings} [settings={}] - Settings object
             */
            /**
             * @type {switchConfig[]} switchConfigs - Array of objects containing the following properties:
             */
            const switchConfigs = [
                {
                    label: _('Show Multi Monitors indicator on Top Panel.'),
                    settingId: SHOW_INDICATOR_ID,
                },
                {
                    label: _('Show Panel on additional monitors.'),
                    settingId: SHOW_PANEL_ID,
                },
                {
                    label: _('Show Activities-Button on additional monitors.'),
                    settingId: SHOW_ACTIVITIES_ID,
                },
                {
                    label: _('Show AppMenu-Button on additional monitors.'),
                    settingId: SHOW_APP_MENU_ID,
                },
                {
                    label: _('Show DateTime-Button on additional monitors.'),
                    settingId: SHOW_DATE_TIME_ID,
                },
                {
                    label: _('Show Thumbnails-Slider on additional monitors.'),
                    settingId: THUMBNAILS_SLIDER_POSITION_ID,
                    options: {
                        none: _('No'),
                        right: _('On the right'),
                        left: _('On the left'),
                        auto: _('Auto'),
                    },
                },
                {
                    label: _('Enable hot corners.'),
                    settingId: ENABLE_HOT_CORNERS,
                    settings: this._desktopSettings,
                },
            ];

            switchConfigs.forEach((config) => {
                if (config.settings) {
                    this._addSettingsBooleanSwitch(
                        config.label,
                        config.settings,
                        config.settingId
                    );
                } else if (config.options) {
                    this._addSettingsComboBoxSwitch(
                        config.label,
                        this._settings,
                        config.settingId,
                        config.options
                    );
                } else {
                    this._addSettingsBooleanSwitch(
                        config.label,
                        this._settings,
                        config.settingId
                    );
                }
            });
        }

        /**
         * Sets up the store for the treeview
         *
         * @private
         */
        _setupStore() {
            this._store = new Gtk.ListStore();
            this._store.set_column_types([
                GObject.TYPE_STRING,
                GObject.TYPE_INT,
            ]);
        }

        /**
         * Creates the treeview for the indicators
         *
         * @private
         */
        _createTreeview() {
            this._treeView = new Gtk.TreeView({
                model: this._store,
                hexpand: true,
                vexpand: true,
            });
            this._treeView.get_selection().set_mode(Gtk.SelectionMode.SINGLE);

            this._addToGrid(this._treeView);
        }

        /**
         * Sets up the columns for the treeview
         *
         * @private
         */
        _setupTreeviewColumns() {
            const appColumn = new Gtk.TreeViewColumn({
                expand: true,
                sort_column_id: Columns.INDICATOR_NAME,
                title: _(
                    'A list of indicators for transfer to additional monitors.'
                ),
            });

            const nameRenderer = new Gtk.CellRendererText();
            appColumn.pack_start(nameRenderer, true);
            appColumn.add_attribute(
                nameRenderer,
                'text',
                Columns.INDICATOR_NAME
            );

            const valueRenderer = new Gtk.CellRendererText();
            appColumn.pack_start(valueRenderer, true);
            appColumn.add_attribute(
                valueRenderer,
                'text',
                Columns.MONITOR_NUMBER
            );

            this._treeView.append_column(appColumn);
        }

        /**
         * Sets up the toolbar for the treeview
         *
         * @private
         */
        _setupToolbar() {
            this._toolbar = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
            });
            this._toolbar.get_style_context().add_class('inline-toolbar');

            this._addToGrid(this._toolbar);
        }

        /**
         * Connects signals to the various widgets
         *
         * @private
         */
        _connectSignals() {
            this._settings.connect(`changed::${TRANSFER_INDICATORS_ID}`, () =>
                this._updateIndicators()
            );
            this._updateIndicators();

            const addTButton = new Gtk.Button({icon_name: 'list-add'});
            addTButton.connect('clicked', () => this._addIndicator);
            this._toolbar.append(addTButton);

            const removeTButton = new Gtk.Button({icon_name: 'list-remove'});
            removeTButton.connect('clicked', () => this._removeIndicator);
            this._toolbar.append(removeTButton);
        }

        /**
         * Updates the indicators in the treeview
         *
         * @private
         */
        _updateIndicators() {
            this._store.clear();

            let transfers = this._settings
                .get_value(TRANSFER_INDICATORS_ID)
                .deep_unpack();

            for (let indicator in transfers) {
                if (transfers.hasOwnProperty(indicator)) {
                    let monitor = transfers[indicator];
                    let iter = this._store.append();
                    this._store.set(
                        iter,
                        [Columns.INDICATOR_NAME, Columns.MONITOR_NUMBER],
                        [indicator, monitor]
                    );
                }
            }
        }

        /**
         * Adds an indicator to the treeview
         *
         * @private
         */
        _addIndicator() {
            const dialog = new Gtk.Dialog({
                title: _('Select indicator'),
                transient_for: this.get_toplevel(),
                modal: true,
            });
            dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
            dialog.add_button(_('Add'), Gtk.ResponseType.OK);
            dialog.set_default_response(Gtk.ResponseType.OK);

            const grid = new Gtk.Grid({
                column_spacing: 10,
                row_spacing: 15,
                margin_top: 10,
                margin_end: 10,
                margin_bottom: 10,
                margin_start: 10,
            });

            grid.set_orientation(Gtk.Orientation.VERTICAL);

            dialog._store = new Gtk.ListStore([GObject.TYPE_STRING]);
            dialog._store.set_column_types([GObject.TYPE_STRING]);

            dialog._treeView = new Gtk.TreeView({
                model: dialog._store,
                hexpand: true,
                vexpand: true,
            });
            dialog._treeView.get_selection().set_mode(Gtk.SelectionMode.SINGLE);

            const appColumn = new Gtk.TreeViewColumn({
                expand: true,
                sort_column_id: 0,
                title: _('Indicators on Top Panel'),
            });

            const nameRenderer = new Gtk.CellRendererText();
            appColumn.pack_start(nameRenderer, true);
            appColumn.add_attribute(nameRenderer, 'text', 0);

            dialog._treeView.append_column(appColumn);

            const availableIndicators = () => {
                let transfers = this._settings
                    .get_value(TRANSFER_INDICATORS_ID)
                    .deep_unpack();
                dialog._store.clear();
                this._settings
                    .get_strv(AVAILABLE_INDICATORS_ID)
                    .forEach((/** @type {any} */ indicator) => {
                        if (!transfers.hasOwnProperty(indicator)) {
                            let iter = dialog._store.append();
                            dialog._store.set(
                                iter,
                                [Columns.INDICATOR_NAME],
                                [indicator]
                            );
                        }
                    });
            };

            const availableIndicatorsId = this._settings.connect(
                `changed::${AVAILABLE_INDICATORS_ID}`,
                availableIndicators
            );

            const transferIndicatorsId = this._settings.connect(
                `changed::${TRANSFER_INDICATORS_ID}`,
                availableIndicators
            );

            availableIndicators.apply(this);
            grid.attach(dialog._treeView, 0, 0, 2, 1);

            const gHBox = new Gtk.Box({
                orientation: Gtk.Orientation.HORIZONTAL,
                margin_top: 10,
                margin_end: 10,
                margin_bottom: 10,
                margin_start: 10,
                spacing: 20,
                hexpand: true,
            });
            const gLabel = new Gtk.Label({
                label: _('Monitor index:'),
                halign: Gtk.Align.START,
            });
            gHBox.append(gLabel);

            dialog._adjustment = new Gtk.Adjustment({
                lower: 0.0,
                upper: 0.0,
                step_increment: 1.0,
            });
            const spinButton = new Gtk.SpinButton({
                halign: Gtk.Align.END,
                adjustment: dialog._adjustment,
                numeric: 1,
            });
            gHBox.append(spinButton);

            const monitorsChanged = () => {
                let numberOfMonitors = this._monitors.get_n_items() - 1;
                dialog._adjustment.set_upper(numberOfMonitors);
                dialog._adjustment.set_value(numberOfMonitors);
            };

            const monitorsChangedId = this._monitors.connect(
                'items-changed',
                monitorsChanged
            );

            monitorsChanged.apply(this);
            grid.append(gHBox);

            dialog.get_content_area().append(grid);

            dialog.connect('response', (dialog, id) => {
                this._monitors.disconnect(monitorsChangedId);
                this._settings.disconnect(availableIndicatorsId);
                this._settings.disconnect(transferIndicatorsId);
                if (id !== Gtk.ResponseType.OK) {
                    dialog.destroy();
                    return;
                }

                let [any, model, iter] = dialog._treeView
                    .get_selection()
                    .get_selected();
                if (any) {
                    let indicator = model.get_value(
                        iter,
                        Columns.INDICATOR_NAME
                    );

                    let transfers = this._settings
                        .get_value(TRANSFER_INDICATORS_ID)
                        .deep_unpack();
                    if (!transfers.hasOwnProperty(indicator)) {
                        transfers[indicator] = dialog._adjustment.get_value();
                        this._settings.set_value(
                            TRANSFER_INDICATORS_ID,
                            new GLib.Variant('a{si}', transfers)
                        );
                    }
                }

                dialog.destroy();
            });
        }

        /**
         * Removes an indicator from the treeview
         *
         * @private
         */
        _removeIndicator() {
            let [any, model, iter] = this._treeView
                .get_selection()
                .get_selected();
            if (any) {
                let indicator = model.get_value(iter, Columns.INDICATOR_NAME);

                let transfers = this._settings
                    .get_value(TRANSFER_INDICATORS_ID)
                    .deep_unpack();
                if (transfers.hasOwnProperty(indicator)) {
                    delete transfers[indicator];
                    this._settings.set_value(
                        TRANSFER_INDICATORS_ID,
                        new GLib.Variant('a{si}', transfers)
                    );
                }
            }
        }

        /**
         * Adds a boolean switch for a setting
         *
         * @param {string} label - Label for the switch
         * @param {Gio.Settings} settings - Settings object
         * @param {string} settingId - Setting ID
         * @param {{[s:string]: string}} [options={}] - Options for the combobox
         * @private
         */
        _addSettingsComboBoxSwitch(label, settings, settingId, options) {
            const gHBox = new Gtk.Box({
                spacing: 20,
                hexpand: true,
            });
            const gLabel = new Gtk.Label({
                label: _(label),
                halign: Gtk.Align.START,
            });
            gHBox.append(gLabel);

            const gCBox = new Gtk.ComboBoxText({halign: Gtk.Align.END});
            if (options) {
                Object.entries(options).forEach(([key, val]) => {
                    gCBox.append(key, val);
                });
            }
            gHBox.append(gCBox);

            this._addToGrid(gHBox);

            settings.bind(
                settingId,
                gCBox,
                'active-id',
                Gio.SettingsBindFlags.DEFAULT
            );
        }

        /**
         * Adds a boolean switch for a setting
         *
         * @param {string} label - Label for the switch
         * @param {Gio.Settings} settings - Settings object to bind to
         * @param {string} settingId - Setting ID
         * @private
         */
        _addSettingsBooleanSwitch(label, settings, settingId) {
            const gHBox = new Gtk.Box({
                spacing: 20,
                hexpand: true,
            });
            const gLabel = new Gtk.Label({
                label: _(label),
                halign: Gtk.Align.START,
            });
            gHBox.append(gLabel);
            const gSwitch = new Gtk.Switch({halign: Gtk.Align.END});
            gHBox.append(gSwitch);
            this._addToGrid(gHBox);

            settings.bind(
                settingId,
                gSwitch,
                'active',
                Gio.SettingsBindFlags.DEFAULT
            );
        }
    }
);

/**
 * @param {object} metadata - The metadata.json file, parsed as JSON
 */
function init(metadata) {
    log(`initializing ${metadata.name} Preferences`);
    Convenience.initTranslations();
}

function fillPreferencesWindow(window) {
    window._settings = Convenience.getSettings();

    const widget = new MultiMonitorsPrefsWidget();

    const page = new Adw.PreferencesPage({
        title: _('General'),
        icon_name: 'dialog-information-symbolic',
    });
    const group = new Adw.PreferencesGroup({
        title: _('Multi Monitors'),
        description: _(
            'Select what information you want to see on additional monitors.'
        ),
    });
    group.add(widget);
    page.add(group);
    window.add(page);
    window.set_default_size(widget.width, widget.height);
    widget.show();
}
