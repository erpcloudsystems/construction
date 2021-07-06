from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.utils import get_datetime, time_diff_in_hours
from frappe import _

class Clearances(Document):
	@frappe.whitelist()
	def get_purchase_items(self):
		process = frappe.get_doc("Purchase Order", self.purchase_order)
		if process:
			if process.items:
				self.add_po_item_in_table(process.items, "items")

	@frappe.whitelist()
	def get_purchase_taxes(self):
		process = frappe.get_doc("Purchase Taxes and Charges Template", self.purchase_taxes_and_charges_template)
		if process:
			if process.taxes:
				self.add_po_taxes_in_table(process.taxes, "taxes")

	@frappe.whitelist()
	def get_sales_items(self):
		process = frappe.get_doc("Sales Order", self.sales_order)
		if process:
			if process.items:
				self.add_so_item_in_table(process.items, "items")

	@frappe.whitelist()
	def get_sales_taxes(self):
		process = frappe.get_doc("Sales Taxes and Charges Template", self.sales_taxes_and_charges_template)
		if process:
			if process.taxes:
				self.add_so_taxes_in_table(process.taxes, "taxes")

	@frappe.whitelist()
	def add_po_item_in_table(self, table_value, table_name):
		self.set(table_name, [])
		for item in table_value:
			po_item = self.append(table_name, {})
			po_item.name1 = item.name
			po_item.item_code = item.item_code
			po_item.item_name = item.item_name
			po_item.description = item.description
			po_item.uom = item.uom
			po_item.qty = item.qty
			po_item.rate = item.rate
			po_item.amount = item.amount
			po_item.previous_qty = item.current_qty
			po_item.previous_amount = item.current_amount

	@frappe.whitelist()
	def add_po_taxes_in_table(self, table_value, table_name):
		self.set(table_name, [])
		for tax in table_value:
			po_tax = self.append(table_name, {})
			po_tax.charge_type = tax.charge_type
			po_tax.account_head = tax.account_head
			po_tax.description = tax.description
			po_tax.rate = tax.rate
			po_tax.tax_amount = tax.tax_amount
			po_tax.total = tax.total

	@frappe.whitelist()
	def add_so_item_in_table(self, table_value, table_name):
		self.set(table_name, [])
		for item in table_value:
			so_item = self.append(table_name, {})
			so_item.name1 = item.name
			so_item.item_code = item.item_code
			so_item.item_name = item.item_name
			so_item.description = item.description
			so_item.uom = item.uom
			so_item.qty = item.qty
			so_item.rate = item.rate
			so_item.amount = item.amount
			so_item.previous_qty = item.current_qty
			so_item.previous_amount = item.current_amount

	@frappe.whitelist()
	def add_so_taxes_in_table(self, table_value, table_name):
		self.set(table_name, [])
		for tax in table_value:
			so_tax = self.append(table_name, {})
			so_tax.charge_type = tax.charge_type
			so_tax.account_head = tax.account_head
			so_tax.description = tax.description
			so_tax.rate = tax.rate
			so_tax.tax_amount = tax.tax_amount
			so_tax.total = tax.total

	pass




