/**
 * @file
 * Provide a helper tab for easier inline editing.
 */

(function ($, Backbone, Drupal, undefined) {

Drupal.behaviors.quickEdit = {
  attach: function (context) {
    // Use backbone in scenarios where navbar tab is used.
    var $body = $(window.parent.document.body).once('quick-edit');
    if ($body.length) {
      var tabModel = Drupal.quickEdit.models.tabModel = new Drupal.quickEdit.TabStateModel();
      var $tab = $('#quick-edit-navbar-tab').once('quick-edit');
      if ($tab.length > 0) {
        Drupal.quickEdit.views.tabView = new Drupal.quickEdit.TabView({
          el: $tab.get(),
          tabModel: tabModel,
        });
      }
    }
  }
};

Drupal.quickEdit = Drupal.quickEdit || {

  // Storage for view and model instances.
  views: {},
  models: {},

  // Backbone Model for the navbar tab state.
  TabStateModel: Backbone.Model.extend({
    defaults: {
      isQuickEditActive: false
    }
  }),

  // Handles the navbar tab interactions.
  TabView: Backbone.View.extend({
    events: {
      'click #quick-edit-trigger-link': 'toggleQuickEdit',
    },

    initialize: function(options) {
      this.tabModel = options.tabModel;
      this.tabModel.on('change:isQuickEditActive', this.render, this);
    },

    render: function() {
      var isQuickEditActive = this.tabModel.get('isQuickEditActive');
      this.$el.toggleClass('active', isQuickEditActive);
      return this;
    },

    toggleQuickEdit: function(event) {
      $quickEditActive = this.tabModel.get('isQuickEditActive');
      $editProcessed = $('.edit-processed');
      $editItems = [];
      $activeItem = '';
      // Create a list of editable children and highlight them.
      if ($editProcessed.length > 1) {
        // Clear storage array.
        $editItems.length = 0;
        // Check all .edit-processed items
        $editProcessed.each(function(index) {
          if ($(this).attr('data-edit-entity-id')) {
            // Highlight or remove contextual link highlights.
            $classes = 'contextual-links-trigger-active quick-edit-contextual-link'
            // Check for Contextual Link as sibling (ie: Panelizer)
            $contextualLink = $(this).siblings('.contextual-links-wrapper').find('.contextual-links-trigger');
            // No sibling, assume it is a child of item.
            if ($contextualLink.length == 0) {
              $contextualLink = $(this).find('.contextual-links-trigger');
            }
            // Add or remove the appropriate classes.
            (!$quickEditActive) ? $contextualLink.addClass($classes) : $contextualLink.removeClass($classes);
            // Search for an active child.
            if ($(this).hasClass('edit-entity-active')) {
              $activeItem = $(this); 
            }
            // Add the editable child to storage array.
            $editItems.push($(this));
          }
        });
        // When there is an active child, clear the list making it exclusive.
        if ($activeItem != '') {
          $editItems.length = 0;
          $editItems.push($activeItem);
        }
        // Activate or deactivate in the case of an only child.
        if ($editItems.length == 1) {
          $state = (!$quickEditActive) ? 'launching' : 'deactivating';
          $item = Drupal.edit.collections.entities.findWhere({
            entityID: $editItems[0].attr('data-edit-entity-id'),
            entityInstanceID: $editItems[0].attr('data-edit-entity-instance-id')
          });
          // Only launch without an active item. Only deactivate with an active item.
          if (($state == 'launching' && $activeItem == '') || ($state == 'deactivating' && $activeItem != '')) {
            $item.set('state', $state);
          }
        }
        // Toggle the active state for the quick edit navbar tab.
        this.tabModel.set('isQuickEditActive', !this.tabModel.get('isQuickEditActive'));
      }
      event.stopPropagation();
      event.preventDefault();
      },
    }),
  };

}(jQuery, Backbone, Drupal));
