# PRD — Events and Orders Dashboard

## 1. Overview

This document describes the requirements for an **events and orders management dashboard**, focusing on financial projections, member segmentation, and access to event-specific information.

The system should allow clear visualization of financial data, member information, and logistical data (such as catering) related to each event.

---

## 2. Product Objectives

- Provide **centralized visualization of orders and events**.
- Generate **financial projections based on registered orders**.
- Facilitate access to **event-specific information**.
- Enable **segmentation of participants by membership status**.
- Provide **important logistical data**, such as catering.

---

## 3. Key Features

### 3.1 Financial Projection of Orders

**Context**

Many orders include only an initial payment of **26% of the booking value**.

**Requirements**

- The dashboard must calculate:
  - **Currently paid** amount.
  - **Total expected** order value.
  - **Remaining balance** to be received.

**Calculation Example**

- Total order value: €100  
- Initial payment (26%): €26  
- Remaining amount: €74  

The system must be able to **project the total expected revenue** considering the full value of the bookings.

---

### 3.2 Individual Event Views

The system must have **individual views for each event**, containing specific information.

**Expected Data per Event**

- Event Name
- Dates
- Number of participants
- Orders placed
- Current revenue
- Projected revenue
- Catering information
- Member segmentation

---

### 3.3 Member Information

The system must classify participants based on membership status.

**Categories**

- **Premium** → VIP/Full member
- **Standard** → Non-member

**Desired Data**

- Number of members
- Number of non-members
- Ability to filter data based on this segmentation

---

### 3.4 Catering Information per Event

The system must allow access to **catering data associated with each event**.

**Possible Data**

- Number of participants who requested catering
- Type of catering
- Total number of meals required
- Distribution by event day (if applicable)

---

## 4. Dashboard Structure (Suggestion)

### Overview

- Total paid revenue
- Total projected revenue
- Total orders
- Total participants

### Events

List of events with access to specific pages containing:

- Participants
- Orders
- Revenue
- Catering
- Membership status

### Participants

Filters:

- Membership status
- Event
- Catering type

---

## 5. Key Metrics

- Current revenue
- Projected revenue
- Percentage paid vs. pending
- Number of members vs. non-members
- Total number of meals

---

## 6. Future Requirements (Possible Extensions)

- Report exportation
- Payment system integration
- Financial forecasting by event
- Detailed catering management
