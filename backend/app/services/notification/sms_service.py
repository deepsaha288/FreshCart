"""SMS Notification Service"""
from datetime import datetime
from typing import Dict, List, Optional


class SMSService:
    """Service to handle SMS alerts for customers"""

    # In-memory sent SMS log for debugging/testing
    SENT_SMS_LOG: List[Dict] = []

    @classmethod
    def send_sms(cls, phone: str, message: str) -> dict:
        """Send an SMS to customer phone number"""
        sms_record = {
            "phone": phone,
            "message": message,
            "sent_at": datetime.utcnow().isoformat(),
            "status": "DELIVERED"
        }
        cls.SENT_SMS_LOG.append(sms_record)

        print(f"[SMS ALERT] To: {phone} | Message: \"{message}\"")

        return {
            "success": True,
            "phone": phone,
            "message": message,
            "sent_at": sms_record["sent_at"]
        }

    @classmethod
    def send_packing_done_sms(cls, phone: str, order_id: str, customer_name: Optional[str] = None) -> dict:
        """Send SMS alert when packing is complete"""
        name_str = f"Hi {customer_name}, " if customer_name else "Hi, "
        msg = f"{name_str}your FreshCart order #{order_id} has been PACKED and is ready for pickup/delivery!"
        return cls.send_sms(phone, msg)
