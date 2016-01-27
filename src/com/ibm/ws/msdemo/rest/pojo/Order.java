package com.ibm.ws.msdemo.rest.pojo;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

@Entity
@Table(name = "OrderTable")
/*
 * define O-R mapping of order table
 */
public class Order {

	@Id //primary key
	@Column(name = "L_ID")
	@GeneratedValue(strategy = GenerationType.AUTO)
	long id;
	
	@Basic
	@Column(name = "itemid")
	String itemid;
	
	@Basic
	@Column(name = "customerid")
	String customerid;
	
	@Basic
	@Column(name = "count")
	int count;

	@Transient
	int expedite;
	
	public long getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	
	public String getItemid() {
		return itemid;
	}
	public void setItemid(String itemid) {
		this.itemid = itemid;
	}

	public String getCustomerid() {
		return customerid;
	}
	public void setCustomerid(String customer_id) {
		this.customerid = customer_id;
	}

	public int getCount() {
		return count;
	}
	public void setCount(int count) {
		this.count = count;
	}

	public int getExpedite() {
		return expedite;
	}
	public void setExpedite(int expedite) {
		this.expedite = expedite;
	}

	@Override
	public String toString() {
		return "{id = " + id + ", itemid=" + itemid + ", customerid=" + customerid
				+ ", count=" + count + ", expedite=" + expedite + "}";
	}


	
}
