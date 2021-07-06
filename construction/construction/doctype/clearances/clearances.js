cur_frm.add_fetch('sales_order',  'project',  'project');
cur_frm.add_fetch('purchase_order',  'project',  'project');
cur_frm.add_fetch('sales_order',  'advanced_payment_insurance_rate',  'advanced_payment_insurance_rate');
cur_frm.add_fetch('purchase_order',  'advanced_payment_insurance_rate',  'advanced_payment_insurance_rate');
cur_frm.add_fetch('sales_order',  'initial_delivery_payment_insurance_rate',  'initial_delivery_payment_insurance_rate');
cur_frm.add_fetch('purchase_order',  'initial_delivery_payment_insurance_rate',  'initial_delivery_payment_insurance_rate');

frappe.ui.form.on("Clearances", {
	setup: function(frm) {
		frm.set_query("purchase_order", function() {
			return {
				filters: [
					["Purchase Order","docstatus", "=", "1"]
				]
			};
		});
	}
});

frappe.ui.form.on("Clearances", {
	setup: function(frm) {
		frm.set_query("sales_order", function() {
			return {
				filters: [
					["Sales Order","docstatus", "=", "1"]
				]
			};
		});
	}
});


frappe.ui.form.on('Clearances',  'clearance_type',  function(frm) {
    if (cur_frm.doc.clearance_type != "Outgoing") {
        cur_frm.set_value('sales_order', '');
        cur_frm.set_value('customer', '');
        cur_frm.set_value('sales_order_date', '');
        cur_frm.set_value('delivery_date', '');
        cur_frm.set_value('project', '');
        cur_frm.set_value('sales_taxes_and_charges_template', '');
        cur_frm.set_value('advanced_payment_insurance_rate', 0);
        cur_frm.set_value('initial_delivery_payment_insurance_rate', 0);
    }
    if (cur_frm.doc.clearance_type != "Incoming") {
        cur_frm.set_value('purchase_order', '');
        cur_frm.set_value('supplier', '');
        cur_frm.set_value('purchase_order_date', '');
        cur_frm.set_value('required_by_date', '');
        cur_frm.set_value('project', '');
        cur_frm.set_value('purchase_taxes_and_charges_template', '');
        cur_frm.set_value('advanced_payment_insurance_rate', 0);
        cur_frm.set_value('initial_delivery_payment_insurance_rate', 0);
    }
});

frappe.ui.form.on('Clearances',  'sales_order',  function(frm) {
    cur_frm.clear_table("items");
    cur_frm.clear_table("taxes");
});

frappe.ui.form.on('Clearances',  'purchase_order',  function(frm) {
    cur_frm.clear_table("items");
    cur_frm.clear_table("taxes");
});

frappe.ui.form.on('Clearances', {
    purchase_order: function(frm) {
		if(frm.doc.purchase_order){
			frappe.call({
				doc: frm.doc,
				method: "get_purchase_items",
				    callback: function(r) {
					refresh_field("items");
				    }
			});
		}
	}
})

frappe.ui.form.on('Clearances', {
    purchase_taxes_and_charges_template: function(frm) {
		if(frm.doc.purchase_taxes_and_charges_template){
			frappe.call({
				doc: frm.doc,
				method: "get_purchase_taxes",
				    callback: function(r) {
                    refresh_field("taxes");				    }
			});
		}
	}
})

frappe.ui.form.on('Clearances', {
    sales_order: function(frm) {
		if(frm.doc.sales_order){
			frappe.call({
				doc: frm.doc,
				method: "get_sales_items",
				    callback: function(r) {
					refresh_field("items");
					refresh_field("taxes");
				    }
			});
		}
	}
})

frappe.ui.form.on('Clearances', {
    sales_taxes_and_charges_template: function(frm) {
		if(frm.doc.sales_taxes_and_charges_template){
			frappe.call({
				doc: frm.doc,
				method: "get_sales_taxes",
				    callback: function(r) {
                    refresh_field("taxes");				    }
			});
		}
	}
})

frappe.ui.form.on("Clearances", "validate", function(frm, cdt, cdn) {
    $.each(frm.doc.items || [], function(i, d) {
        d.current_amount = d.current_qty * d.rate;
        d.current_progress = 100 * d.current_qty / d.qty;
        d.previous_progress = 100 * d.previous_qty / d.qty;
        d.completed_qty = d.current_qty + d.previous_qty;
        d.completed_amount = d.completed_qty * d.rate;
        d.completed_progress = 100 * d.completed_qty / d.qty;
        d.remaining_qty = d.qty - d.completed_qty;
        d.remaining_amount = d.remaining_qty * d.rate;
        d.remaining_progress = 100 * d.remaining_qty / d.qty;
    });
});

frappe.ui.form.on("Clearances", "validate", function(frm, cdt, cdn) {
    $.each(frm.doc.items || [], function(i, d) {
        if (d.current_qty > d.qty){
            frappe.throw("Current Qty Cannot Be Greater Than Order Qty");
        }
        if (d.current_qty > d.remaining_qty){
            frappe.throw("Current Qty Cannot Be Greater Than Remaining Qty");
        }
        if (!d.current_qty){
            frappe.throw("Please Enter The Current Qty");
        }
    });
});

frappe.ui.form.on("Clearances", {
    validate:function(frm, cdt, cdn){
        var dw = locals[cdt][cdn];
        var total = 0;
        frm.doc.items.forEach(function(dw) { total += dw.current_amount; });
        frm.set_value("total_current_amount", total);
        refresh_field("total_current_amount");
    },
});

frappe.ui.form.on("Clearances","validate", function(){
    for (var i = 0; i < cur_frm.doc.taxes.length; i++){
        cur_frm.doc.taxes[i].tax_amount = cur_frm.doc.taxes[i].rate * cur_frm.doc.total_current_amount / 100;
        cur_frm.doc.taxes[i].total = cur_frm.doc.taxes[i].tax_amount + cur_frm.doc.total_current_amount;
    }
    cur_frm.refresh_field('taxes');
});

frappe.ui.form.on("Clearances", {
    validate:function(frm, cdt, cdn){
        var dw = locals[cdt][cdn];
        var total = 0;
        frm.doc.taxes.forEach(function(dw) { total += dw.total; });
        frm.set_value("total_taxes_amount", total);
        refresh_field("total_taxes_amount");
    },
});

frappe.ui.form.on("Clearances","validate", function(){
        cur_frm.doc.advanced_payment_insurance_amount = cur_frm.doc.total_taxes_amount * cur_frm.doc.advanced_payment_insurance_rate / 100;
        cur_frm.doc.initial_delivery_payment_insurance_amount = cur_frm.doc.total_taxes_amount * cur_frm.doc.initial_delivery_payment_insurance_rate / 100;
});

frappe.ui.form.on("Clearances", "on_submit", function(frm) {
    if(cur_frm.doc.sales_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Sales Order Item",  d.name1, "current_qty", d.completed_qty);
        });
    }
});

frappe.ui.form.on("Clearances", "on_submit", function(frm) {
    if(cur_frm.doc.sales_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Sales Order Item",  d.name1, "current_amount", d.completed_amount);
        });
    }
});

frappe.ui.form.on("Clearances", "on_submit", function(frm) {
    if(cur_frm.doc.purchase_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Purchase Order Item",  d.name1, "current_qty", d.completed_qty);
        });
    }
});

frappe.ui.form.on("Clearances", "on_submit", function(frm) {
    if(cur_frm.doc.purchase_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Purchase Order Item",  d.name1, "current_amount", d.completed_amount);
        });
    }
});

frappe.ui.form.on("Clearances", "after_cancel", function(frm) {
    if(cur_frm.doc.purchase_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Purchase Order Item",  d.name1, "current_qty", d.previous_qty);
        });
    }
});

frappe.ui.form.on("Clearances", "after_cancel", function(frm) {
    if(cur_frm.doc.purchase_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Purchase Order Item",  d.name1, "current_amount", d.previous_amount);
        });
    }
});

frappe.ui.form.on("Clearances", "after_cancel", function(frm) {
    if(cur_frm.doc.sales_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Sales Order Item",  d.name1, "current_qty", d.previous_qty);
        });
    }
});

frappe.ui.form.on("Clearances", "after_cancel", function(frm) {
    if(cur_frm.doc.sales_order){
        $.each(frm.doc.items || [], function(i, d) {
            frappe.db.set_value("Sales Order Item",  d.name1, "current_amount", d.previous_amount);
        });
    }
});