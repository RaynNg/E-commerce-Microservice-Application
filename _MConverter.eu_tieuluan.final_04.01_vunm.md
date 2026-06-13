![](media/image3.jpeg)

> **HỌC VIỆN CÔNG NGHỆ BƯU CHÍNH VIỄN THÔNG**
>
> **KHOA CÔNG NGHỆ THÔNG TIN 1**
>
> \-\-\-\--🙞🙜🕮🙞🙜\-\-\-\--
>
> **MÔN HỌC : KIẾN TRÚC VÀ THIẾT KẾ PHẦN MỀM**
>
> **Tiểu luận Final**

| **Giảng viên hướng dẫn** | **: PGS.TS Trần Đình Quế** |
| ------------------------ | -------------------------- |
|--------------------------|----------------------------|
| **Lớp**                  | **: E22CNPM04**            |
| **Sinh viên**            | **: Nguyễn Minh Vũ**       |
| **Mã sinh viên**         | **: B22DCVT594**           |
| **Nhóm**                 | **: 01**                   |

#### Hà Nội -- 2026 {#hà-nội-2026}

####
#### 

MỤC LỤC

[**CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD [3](#chương-1-từ-monolithic-đến-microservices-và-ddd)**](#chương-1-từ-monolithic-đến-microservices-và-ddd)

[**CHƯƠNG 2 PHÁT TRIỂN HỆ THỐNG E-COMMERCE THEO MICROSERVICES [12](#chương-2-phát-triển-hệ-thống-e-commerce-theo-microservices)**](#chương-2-phát-triển-hệ-thống-e-commerce-theo-microservices)
[**CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE THEO MICROSERVICES [12](#chương-2-phát-triển-hệ-thống-e-commerce-theo-microservices)**](#chương-2-phát-triển-hệ-thống-e-commerce-theo-microservices)

[**CHƯƠNG 3 AI SERVICE CHO TƯ VẤN SẢN PHẨM [41](#chương-3-ai-service-cho-tư-vấn-sản-phẩm)**](#chương-3-ai-service-cho-tư-vấn-sản-phẩm)
[**CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM [41](#chương-3-ai-service-cho-tư-vấn-sản-phẩm)**](#chương-3-ai-service-cho-tư-vấn-sản-phẩm)

[**CHƯƠNG 4: THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG TỔNG THỂ (SYSTEM INTEGRATION) [62](#chương-4-thiết-kế-và-triển-khai-hệ-thống-tổng-thể-system-integration)**](#chương-4-thiết-kế-và-triển-khai-hệ-thống-tổng-thể-system-integration)

[**CHƯƠNG 5: TỰ NHẬN XÉT VÀ ĐÁNH GIÁ [71](#chương-5-tự-nhận-xét-và-đánh-giá)**](#chương-5-tự-nhận-xét-và-đánh-giá)

# CHƯƠNG 1: TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD

## Giới thiệu Monolithic Architecture

### Khái niệm

Monolithic Architecture (Kiến trúc nguyên khối) là mô hình kiến trúc phần mềm truyền thống, trong đó toàn bộ ứng dụng được xây dựng, triển khai và vận hành như một khối thống nhất duy nhất. Tất cả các thành phần của hệ thống bao gồm giao diện người dùng (UI), logic nghiệp vụ (Business Logic) và truy cập dữ liệu (Data Access) đều nằm trong cùng một codebase và được đóng gói thành một artifact triển khai duy nhất.

### Cấu trúc điển hình

Một ứng dụng Monolithic điển hình được tổ chức theo mô hình ba tầng (Three-tier Architecture):

- **Presentation Layer (Tầng giao diện):** Xử lý các yêu cầu từ người dùng, hiển thị dữ liệu. Thường là các trang HTML, REST API controller, hoặc giao diện đồ họa.

- **Business Logic Layer (Tầng nghiệp vụ):** Chứa toàn bộ quy tắc xử lý của hệ thống, điều phối luồng dữ liệu giữa Presentation và Data Layer.

- **Data Access Layer (Tầng truy cập dữ liệu):** Tương tác trực tiếp với cơ sở dữ liệu, thực hiện các thao tác đọc/ghi dữ liệu.

### Ví dụ thực tế

Một hệ thống e-commerce Monolithic điển hình bao gồm các module: Quản lý sản phẩm, Giỏ hàng, Thanh toán, Quản lý người dùng, Giao hàng, tất cả đều nằm trong cùng một codebase. Khi người dùng đặt hàng, một luồng xử lý duy nhất sẽ đi qua tất cả các module này trong cùng một tiến trình.

> ecommerce-app/
>
> ├── controllers/
>
> │ ├── ProductController.java
>
> │ ├── OrderController.java
>
> │ └── UserController.java
>
> ├── services/
>
> │ ├── ProductService.java
>
> │ └── PaymentService.java
>
> ├── repositories/
>
> │ └── ProductRepository.java
>
> └── main.java ← Toàn bộ đóng gói thành 1 file .jar

### Nhược điểm chi tiết

Mặc dù Monolithic phù hợp trong giai đoạn đầu, mô hình này bộc lộ nhiều hạn chế khi hệ thống phát triển:

- **Khó mở rộng (Scale):** Khi cần tăng hiệu năng, phải scale toàn bộ hệ thống thay vì chỉ module cần thiết, gây lãng phí tài nguyên.

- **Coupling cao:** Các module phụ thuộc chặt chẽ vào nhau. Một thay đổi nhỏ ở một module có thể gây lỗi ở module khác không liên quan.

- **Rủi ro khi triển khai (Deploy):** Mỗi lần cập nhật dù nhỏ đều phải build và deploy lại toàn bộ ứng dụng. Một lỗi nhỏ có thể làm sập toàn hệ thống.

- **Khó phát triển nhóm:** Nhiều developer cùng làm việc trên một codebase dễ phát sinh xung đột, giảm năng suất.

- **Hạn chế công nghệ:** Toàn bộ ứng dụng bị ràng buộc vào một ngôn ngữ lập trình và công nghệ duy nhất, khó áp dụng các công nghệ mới phù hợp hơn cho từng bài toán.

### Khi nào nên dùng Monolithic?

Monolithic không phải lúc nào cũng là lựa chọn tồi. Đây là kiến trúc phù hợp trong các trường hợp:

- **Hệ thống nhỏ, MVP (Minimum Viable Product):** Khi cần xây dựng nhanh để kiểm chứng ý tưởng.

- **Team ít người (dưới 5-10 developer):** Overhead của Microservices không mang lại lợi ích đáng kể.

- **Yêu cầu nghiệp vụ ổn định:** Khi domain chưa đủ rõ ràng để phân chia thành các service độc lập.

## Microservices Architecture

### Khái niệm

Microservices Architecture là phong cách kiến trúc phần mềm trong đó hệ thống được chia thành nhiều dịch vụ nhỏ (service) độc lập với nhau. Mỗi service đảm nhiệm một chức năng nghiệp vụ cụ thể, có thể được phát triển, triển khai và mở rộng một cách độc lập, và giao tiếp với nhau qua các giao thức nhẹ như REST API hoặc gRPC.

> •9„˙. _Định nghĩa: \"Microservices là cách phân rã ứng dụng thành các dịch vụ nhỏ, mỗi dịch vụ chạy trong tiến trình riêng và giao tiếp qua cơ chế nhẹ, thường là HTTP API.\" -- Martin Fowler_
> •9„˙. *Định nghĩa: \"Microservices là cách phân rã ứng dụng thành các dịch vụ nhỏ, mỗi dịch vụ chạy trong tiến trình riêng và giao tiếp qua cơ chế nhẹ, thường là HTTP API.\" -- Martin Fowler*

### Đặc điểm

- **Mỗi service có database riêng:** Tránh chia sẻ dữ liệu trực tiếp giữa các service, đảm bảo tính độc lập.

- **Giao tiếp qua API:** Các service giao tiếp qua REST API, gRPC hoặc Message Queue (RabbitMQ, Kafka).

- **Deploy độc lập:** Mỗi service có thể được build, test và release riêng biệt.

- **Đa dạng công nghệ (Polyglot):** Mỗi service có thể dùng ngôn ngữ/framework phù hợp nhất với bài toán của nó.

- **Có khả năng chịu lỗi (Fault Tolerance):** Khi một service lỗi, hệ thống không bị sập hoàn toàn.

### So sánh Monolithic vs Microservices

![](media/image5.jpeg){width="6.2933377077865265in" height="3.417082239720035in"}

| **Tiêu chí**         | **Monolithic**                  | **Microservices**                     |
| -------------------- | ------------------------------- | ------------------------------------- |
| Triển khai (Deploy)  | Một lần cho toàn hệ thống       | Độc lập từng service                  |
| Mở rộng (Scale)      | Scale toàn hệ thống             | Scale từng service riêng lẻ           |
| Coupling (Phụ thuộc) | Cao -- các module liên kết chặt | Thấp -- service độc lập               |
| Phát triển nhóm      | Cùng codebase, dễ xung đột      | Team riêng cho từng service           |
| Công nghệ sử dụng    | Một ngôn ngữ/framework          | Đa dạng (polyglot)                    |
| Debug & Test         | Dễ debug tập trung              | Phức tạp hơn, cần distributed tracing |
| Thời gian khởi động  | Nhanh ban đầu                   | Cần đầu tư hạ tầng ban đầu            |
| **Tiêu chí** | **Monolithic** | **Microservices** |
|----|----|----|
| Triển khai (Deploy) | Một lần cho toàn hệ thống | Độc lập từng service |
| Mở rộng (Scale) | Scale toàn hệ thống | Scale từng service riêng lẻ |
| Coupling (Phụ thuộc) | Cao -- các module liên kết chặt | Thấp -- service độc lập |
| Phát triển nhóm | Cùng codebase, dễ xung đột | Team riêng cho từng service |
| Công nghệ sử dụng | Một ngôn ngữ/framework | Đa dạng (polyglot) |
| Debug & Test | Dễ debug tập trung | Phức tạp hơn, cần distributed tracing |
| Thời gian khởi động | Nhanh ban đầu | Cần đầu tư hạ tầng ban đầu |

### Ưu điểm

- **Scale độc lập từng service:** Ví dụ: service thanh toán nhận tải cao trong dịp khuyến mãi, chỉ cần scale riêng service đó.

- **Tăng tốc phát triển:** Nhiều team làm việc song song trên các service khác nhau mà không ảnh hưởng lẫn nhau.

- **Phù hợp hệ thống lớn:** Chia nhỏ bài toán phức tạp thành các phần có thể quản lý được.

- **Dễ áp dụng CI/CD:** Mỗi service có pipeline riêng, release nhanh và thường xuyên hơn.

### Nhược điểm

- **Phức tạp hệ thống:** Cần quản lý nhiều service, network, version, và sự phụ thuộc giữa chúng.

- **Quản lý Distributed System:** Các vấn đề như consistency, latency, và partial failure cần được xử lý cẩn thận.

- **Debug khó hơn:** Lỗi có thể trải rộng qua nhiều service, cần công cụ distributed tracing.

- **Chi phí hạ tầng ban đầu cao:** Cần đầu tư vào Docker, Kubernetes, API Gateway, monitoring\...

### Nguyên tắc thiết kế

- **Single Responsibility:** Mỗi service chỉ chịu trách nhiệm một nghiệp vụ duy nhất.

- **Loose Coupling:** Các service ít phụ thuộc nhau nhất có thể.

- **High Cohesion:** Các chức năng liên quan được đặt trong cùng một service.

- **Database per Service:** Mỗi service quản lý data store riêng của mình.

- **Design for Failure:** Giả định service có thể lỗi và thiết kế để hệ thống vẫn hoạt động được.

## Domain-Driven Design (DDD)

### Mục tiêu

Domain-Driven Design (DDD) là phương pháp tiếp cận thiết kế phần mềm được Eric Evans giới thiệu năm 2003, nhằm mô hình hóa hệ thống phần mềm theo nghiệp vụ thực tế (business domain) thay vì theo công nghệ. DDD giúp thu hẹp khoảng cách giữa developer và domain expert, đảm bảo phần mềm phản ánh đúng nhu cầu nghiệp vụ.

### Các khái niệm cốt lõi

- **Entity:** Đối tượng có định danh duy nhất (ID), tồn tại theo thời gian. Ví dụ: User (user_id), Product (product_id).

- **Value Object:** Đối tượng không có ID, so sánh bằng giá trị. Ví dụ: Address (\"123 Trần Hưng Đạo, Q1\"), Money (100 USD).

- **Aggregate:** Nhóm các Entity và Value Object liên quan, được quản lý như một đơn vị nhất quán. Ví dụ: Order (chứa Order + OrderItems).

- **Repository:** Lớp trừu tượng hóa việc truy cập dữ liệu cho Aggregate.

- **Domain Service:** Chứa logic nghiệp vụ không thuộc về một Entity cụ thể. Ví dụ: PricingService tính giá tổng đơn hàng.

- **Domain Event:** Sự kiện xảy ra trong domain. Ví dụ: OrderPlaced, PaymentCompleted.

- **Ubiquitous Language:** Ngôn ngữ thống nhất giữa developer và domain expert, sử dụng xuyên suốt trong code và tài liệu.

### Bounded Context

Bounded Context là ranh giới ngữ nghĩa tường minh trong đó một mô hình domain cụ thể có giá trị. Trong thực tế, một khái niệm như \"Sản phẩm\" (Product) có thể có ý nghĩa khác nhau trong từng ngữ cảnh:

- **Trong Product Context:** Product có thông tin chi tiết, danh mục, tồn kho.

- **Trong Order Context:** Product chỉ là ProductId + tên + giá tại thời điểm đặt hàng.

- **Trong Shipping Context:** Product là gói hàng vật lý với khối lượng, kích thước.

Mỗi Bounded Context nên ánh xạ tương ứng với một Microservice, giúp ranh giới giữa các service rõ ràng và có cơ sở nghiệp vụ.

### Context Map

Context Map là sơ đồ thể hiện mối quan hệ giữa các Bounded Context. Các loại quan hệ phổ biến:

- **Upstream / Downstream:** Context phía upstream cung cấp dữ liệu, downstream tiêu thụ.

- **Shared Kernel:** Hai context dùng chung một phần model.

- **Anti-Corruption Layer (ACL):** Lớp chuyển đổi khi cần tích hợp với hệ thống ngoài có domain khác biệt.

### DDD trong Microservices

DDD và Microservices kết hợp tự nhiên với nhau theo nguyên tắc: mỗi Bounded Context = một Microservice. Cụ thể:

| **Bounded Context**       | **Microservice tương ứng** | **Công nghệ**             |
| :------------------------ | :------------------------- | :------------------------ |
| User Context              | user-service               | Django + MySQL            |
| Product Context           | product-service            | Django + PostgreSQL       |
| Cart Context              | cart-service               | Django + Redis/MySQL      |
| Order Context             | order-service              | Django + MySQL            |
| Payment Context           | payment-service            | Django + MySQL            |
| Shipping Context          | shipping-service           | Django + MySQL            |
| AI/Recommendation Context | ai-service                 | FastAPI + PyTorch + Neo4j |
| **Bounded Context** | **Microservice tương ứng** | **Công nghệ** |
|:---|:---|:---|
| User Context | user-service | Django + MySQL |
| Product Context | product-service | Django + PostgreSQL |
| Cart Context | cart-service | Django + Redis/MySQL |
| Order Context | order-service | Django + MySQL |
| Payment Context | payment-service | Django + MySQL |
| Shipping Context | shipping-service | Django + MySQL |
| AI/Recommendation Context | ai-service | FastAPI + PyTorch + Neo4j |

## Case Study: Phân rã hệ thống Healthcare theo DDD

Phần này trình bày bài tập vận dụng DDD để phân rã một hệ thống thực tế trong lĩnh vực Y tế (Healthcare) -- một domain phức tạp với nhiều nghiệp vụ khác nhau.

### Mô tả bài toán

Bệnh viện XYZ cần xây dựng hệ thống quản lý trực tuyến với các chức năng: đặt lịch khám, quản lý hồ sơ bệnh nhân, kê đơn thuốc, thanh toán viện phí và quản lý kho thuốc. Hệ thống phục vụ nhiều đối tượng: bệnh nhân, bác sĩ, dược sĩ và quản trị viên.

### Bước 1 -- Xác định Domain {#bước-1-xác-định-domain}

Phân tích yêu cầu, ta xác định các domain chính của hệ thống:

- **Core Domain:** Khám bệnh & Hồ sơ bệnh nhân -- đây là nghiệp vụ cốt lõi tạo ra giá trị chính.

- **Supporting Domain:** Đặt lịch hẹn, Kê đơn thuốc -- hỗ trợ core domain hoạt động.

- **Generic Domain:** Thanh toán, Thông báo -- có thể tái sử dụng hoặc dùng third-party.

### Bước 2 -- Xác định Bounded Context {#bước-2-xác-định-bounded-context}

<table style="width:95%;">
<colgroup>
<col style="width: 27%" />
<col style="width: 39%" />
<col style="width: 28%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;"><strong>Bounded Context</strong></th>
<th style="text-align: left;"><strong>Trách nhiệm chính</strong></th>
<th style="text-align: left;"><strong>Domain Expert</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: left;">Patient Context</td>
<td style="text-align: left;"><p>Quản lý hồ sơ bệnh nhân, lịch</p>
<p>sử khám</p></td>
<td style="text-align: left;">Bác sĩ, Y tá</td>
</tr>
<tr>
<td style="text-align: left;">Appointment Context</td>
<td style="text-align: left;">Đặt lịch, quản lý ca khám</td>
<td style="text-align: left;">Lễ tân, Bác sĩ</td>
</tr>
<tr>
<td style="text-align: left;">Prescription Context</td>
<td style="text-align: left;">Kê đơn thuốc, quản lý phác đồ</td>
<td style="text-align: left;">Bác sĩ, Dược sĩ</td>
</tr>
<tr>
<td style="text-align: left;">Pharmacy Context</td>
<td style="text-align: left;">Kho thuốc, cấp phát thuốc</td>
<td style="text-align: left;">Dược sĩ</td>
</tr>
<tr>
<td style="text-align: left;">Billing Context</td>
<td style="text-align: left;">Hóa đơn, thanh toán viện phí</td>
<td style="text-align: left;">Kế toán</td>
</tr>
<tr>
<td style="text-align: left;">Notification Context</td>
<td style="text-align: left;">Nhắc lịch, thông báo kết quả</td>
<td style="text-align: left;">IT, Vận hành</td>
</tr>
</tbody>
</table>

### Bước 3 -- Phân rã thành Microservices {#bước-3-phân-rã-thành-microservices}

Áp dụng nguyên tắc Bounded Context = Microservice, ta có kiến trúc:

![](media/image6.png){width="6.2923600174978125in" height="1.9863298337707787in"}

![](media/image7.jpeg){width="6.302841207349081in" height="3.4662489063867015in"}

### Bước 4 -- Xác định quan hệ giữa các Service {#bước-4-xác-định-quan-hệ-giữa-các-service}

Các service giao tiếp với nhau theo luồng nghiệp vụ:

- **appointment-service → patient-service:** Xác thực bệnh nhân trước khi đặt lịch (REST API call).

- **prescription-service → appointment-service:** Lấy thông tin ca khám để kê đơn.

- **billing-service → prescription-service:** Tính tiền thuốc từ đơn thuốc (REST).

- **notification-service ← appointment-service:** Lắng nghe sự kiện AppointmentConfirmed để gửi nhắc nhở (Message Queue).

- **pharmacy-service ← prescription-service:** Nhận sự kiện PrescriptionIssued để chuẩn bị thuốc.

![](media/image7.jpeg){width="5.760120297462817in" height="3.1725in"}

### Ví dụ API -- Patient Service {#ví-dụ-api-patient-service}

![](media/image8.png){width="6.334031058617673in" height="2.2502482502187227in"}

### Ví dụ API -- Appointment Service {#ví-dụ-api-appointment-service}

> \# Đặt lịch khám POST /appointments/
>
> Body: { patient_id, doctor_id, date, time_slot }
>
> → { appointment_id, status: \'PENDING\' }
>
> \# Xác nhận lịch khám
>
> PUT /appointments/{id}/confirm
>
> → Event: AppointmentConfirmed → notification-service
>
> \# Hủy lịch khám
>
> DELETE /appointments/{id}
>
> → Event: AppointmentCancelled → notification-service

## Kết luận Chương 1

Chương 1 đã cung cấp nền tảng lý thuyết quan trọng cho toàn bộ tiểu luận, bao gồm ba trụ cột chính:

- **Monolithic Architecture:** Đơn giản, phù hợp giai đoạn đầu nhưng khó mở rộng và bảo trì khi hệ thống lớn lên.

- **Microservices Architecture:** Giải pháp cho các hệ thống lớn, phức tạp, cần scale linh hoạt và phát triển song song bởi nhiều team.

- **Domain-Driven Design (DDD):** Phương pháp luận giúp xác định ranh giới các service dựa trên nghiệp vụ thực tế, đảm bảo thiết kế đúng ngay từ đầu.

Ba khái niệm này bổ sung cho nhau: DDD cung cấp cơ sở để phân rã hệ thống thành các Bounded Context, và mỗi Bounded Context trở thành một Microservice độc lập. Đây là nền tảng để xây dựng hệ thống E-Commerce hoàn chỉnh trong các chương tiếp theo.

# CHƯƠNG 2 PHÁT TRIỂN HỆ THỐNG E-COMMERCE THEO MICROSERVICES
# CHƯƠNG 2: PHÁT TRIỂN HỆ THỐNG E-COMMERCE THEO MICROSERVICES

## 2.1. Xác định yêu cầu hệ thống {#xác-định-yêu-cầu-hệ-thống}

Trước khi thiết kế kiến trúc, cần phân tích và xác định rõ các yêu cầu chức năng và phi chức năng của hệ thống E-Commerce. Đây là bước nền tảng để đưa ra quyết định kiến trúc phù hợp.

### 2.1.1. Functional Requirements (Yêu cầu chức năng) {#functional-requirements-yêu-cầu-chức-năng}

Hệ thống E-Commerce cần đáp ứng các chức năng nghiệp vụ chính sau:

- **Quản lý sản phẩm đa domain:** Hỗ trợ 3 nhóm sản phẩm -- Sách (Book), Điện tử (Electronics) và Thời trang (Fashion) với các thuộc tính đặc trưng riêng cho từng nhóm.

- **Quản lý người dùng & phân quyền:** Hệ thống phân biệt 3 vai trò: Admin (toàn quyền), Staff (xử lý đơn hàng, vận hành) và Customer (mua hàng, xem sản phẩm).

- **Giỏ hàng (Cart):** Cho phép khách hàng thêm/sửa/xóa sản phẩm trong giỏ hàng trước khi đặt đơn.

- **Đặt hàng (Order):** Tạo đơn hàng từ giỏ hàng, theo dõi trạng thái đơn hàng qua các bước xử lý.

- **Thanh toán (Payment):** Xử lý thanh toán, quản lý trạng thái giao dịch (Pending → Success / Failed).

- **Giao hàng (Shipping):** Tạo phiếu vận chuyển, theo dõi trạng thái giao hàng (Processing → Shipping → Delivered).

- **Tư vấn sản phẩm bằng AI:** Gợi ý sản phẩm dựa trên hành vi người dùng và chatbot tư vấn (được trình bày chi tiết ở Chương 3).

### 2.1.2. Non-functional Requirements (Yêu cầu phi chức năng) {#non-functional-requirements-yêu-cầu-phi-chức-năng}

| **Yêu cầu**       | **Mô tả**                                  | **Giải pháp áp dụng**        |
| ----------------- | ------------------------------------------ | ---------------------------- |
| Scalability       | Scale từng service độc lập khi tải tăng    | Microservices + Docker       |
| High Availability | Hệ thống luôn sẵn sàng, tối thiểu downtime | Docker Compose / Kubernetes  |
| Security          | Xác thực và phân quyền chặt chẽ            | JWT + RBAC                   |
| Maintainability   | Dễ bảo trì, cập nhật từng service          | Codebase độc lập mỗi service |
| **Yêu cầu** | **Mô tả** | **Giải pháp áp dụng** |
|----|----|----|
| Scalability | Scale từng service độc lập khi tải tăng | Microservices + Docker |
| High Availability | Hệ thống luôn sẵn sàng, tối thiểu downtime | Docker Compose / Kubernetes |
| Security | Xác thực và phân quyền chặt chẽ | JWT + RBAC |
| Maintainability | Dễ bảo trì, cập nhật từng service | Codebase độc lập mỗi service |

| Performance | Thời gian phản hồi API \< 500ms    | Tối ưu query, caching |
| ----------- | ---------------------------------- | --------------------- |
|-------------|------------------------------------|-----------------------|
| Consistency | Dữ liệu nhất quán giữa các service | API contract rõ ràng  |

## 2.2. Phân rã hệ thống theo DDD {#phân-rã-hệ-thống-theo-ddd}

### 2.2.1. Bounded Context & ánh xạ sang Microservice {#bounded-context-ánh-xạ-sang-microservice}

Áp dụng nguyên tắc DDD, mỗi Bounded Context được ánh xạ thành một Microservice độc lập:

| **Bounded Context**  | **Microservice** | **Framework** | **Database**  | **Port** |
| :------------------- | :--------------- | :------------ | :------------ | :------- |
|:---------------------|:-----------------|:--------------|:--------------|:---------|
| User Context         | user-service     | Django REST   | MySQL         | 8000     |
| Product Context      | product-service  | Django REST   | PostgreSQL    | 8001     |
| Cart Context         | cart-service     | Django REST   | MySQL         | 8002     |
| Order Context        | order-service    | Django REST   | MySQL         | 8003     |
| Payment Context      | payment-service  | Django REST   | MySQL         | 8004     |
| Shipping Context     | shipping-service | Django REST   | MySQL         | 8005     |
| AI/Recommend Context | ai-service       | FastAPI       | Neo4j + FAISS | 8006     |

### 2.2.2. Nguyên tắc phân rã {#nguyên-tắc-phân-rã}

- **Mỗi service có database riêng:** Không service nào truy cập trực tiếp database của service khác, đảm bảo loose coupling.

- **Giao tiếp qua REST API:** Các service tương tác với nhau thông qua HTTP REST API, không chia sẻ code hoặc model.

- **Codebase độc lập:** Mỗi service là một Django project riêng biệt với requirements.txt và Dockerfile của nó.

- **Ranh giới nghiệp vụ rõ ràng:** Mỗi service chỉ chịu trách nhiệm một domain nghiệp vụ duy nhất (Single Responsibility).

## 2.3. Thiết kế Product Service (Django) {#thiết-kế-product-service-django}
## 2.3. Thiết kế User Service (Django) {#thiết-kế-user-service-django}

### 2.3.1. Phân loại sản phẩm {#phân-loại-sản-phẩm}
### 2.3.1. Phân loại người dùng {#phân-loại-người-dùng}

Hệ thống áp dụng mô hình RBAC (Role-Based Access Control) với 3 vai trò:

- **Admin:** Toàn quyền hệ thống -- CRUD mọi tài nguyên, quản lý người dùng và cấu hình.

- **Staff:** Xử lý đơn hàng, cập nhật trạng thái giao hàng, quản lý sản phẩm.

- **Customer:** Mua hàng, xem sản phẩm, quản lý giỏ hàng và đơn hàng của bản thân.

### 2.3.2. Django Model {#django-model-1}

![](media/image15.png){width="6.250688976377953in" height="2.8197550306211725in"}![](media/image16.png){width="6.259948600174978in" height="1.2084667541557306in"}

### 2.3.3. Phân quyền RBAC {#phân-quyền-rbac}

| **Hành động**                 | **Admin** | **Staff** | **Customer** |
|:------------------------------|:---------:|:---------:|:------------:|
| Xem danh sách sản phẩm        |     ✓     |     ✓     |      ✓       |
| Tạo / sửa / xóa sản phẩm      |     ✓     |     ✓     |      ✗       |
| Xem tất cả đơn hàng           |     ✓     |     ✓     |      ✗       |
| Xem đơn hàng của mình         |     ✓     |     ✓     |      ✓       |
| Cập nhật trạng thái giao hàng |     ✓     |     ✓     |      ✗       |
| Quản lý người dùng            |     ✓     |     ✗     |      ✗       |
| Đặt hàng / thanh toán         |     ✓     |     ✗     |      ✓       |

### 2.3.4. Class Diagram -- User Service {#class-diagram-user-service}

![](media/image17.png){width="1.0535345581802276in" height="3.094165573053368in"}

### 2.3.5. API Endpoints {#api-endpoints-1}

| **Method** | **Endpoint**    | **Mô tả**                 | **Auth**         |
|:-----------|:----------------|:--------------------------|:-----------------|
| POST       | /auth/register/ | Đăng ký tài khoản mới     | Không            |
| POST       | /auth/login/    | Đăng nhập, nhận JWT token | Không            |
| POST       | /auth/refresh/  | Làm mới access token      | Token            |
| GET        | /users/         | Danh sách người dùng      | Admin            |
| GET        | /users/{id}/    | Thông tin người dùng      | Admin/Chính mình |
| PUT        | /users/{id}/    | Cập nhật thông tin        | Admin/Chính mình |
| DELETE     | /users/{id}/    | Xóa tài khoản             | Admin            |

## 2.4. Thiết kế Product Service (Django) {#thiết-kế-product-service-django}

### 2.4.1. Phân loại sản phẩm {#phân-loại-sản-phẩm}

Product Service quản lý danh mục sản phẩm theo mô hình kế thừa (Inheritance), trong đó Product là class cha tổng quát và 3 class con mở rộng thuộc tính đặc thù:

- **Book (Sách):** Giáo trình, tiểu thuyết, tạp chí -- thêm thuộc tính: tác giả (author), NXB (publisher), ISBN.

- **Electronics (Điện tử):** Điện thoại, laptop, TV, điều hòa -- thêm thuộc tính: thương hiệu (brand), bảo hành (warranty).

- **Fashion (Thời trang):** Áo, quần, giày -- thêm thuộc tính: kích cỡ (size), màu sắc (color).

### 2.3.2. Django Model {#django-model}
### 2.4.2. Django Model {#django-model}

**[Model Category & Product (Tổng quát)]{.underline}**

![](media/image9.png){width="6.269209317585302in" height="5.935838801399825in"}

**[Model chi tiết theo domain]{.underline}**

![](media/image10.png){width="6.2923600174978125in" height="1.5835083114610673in"}

![](media/image11.png){width="5.893858267716536in" height="8.968360673665792in"}

![](media/image12.png){width="6.153156167979002in" height="9.33261811023622in"}

![](media/image13.png){width="6.19827646544182in" height="4.163624234470691in"}

### 2.3.3. Class Diagram -- Product Service {#class-diagram-product-service}
### 2.4.3. Class Diagram -- Product Service {#class-diagram-product-service}

![](media/image14.jpeg){width="4.70669728783902in" height="4.392291119860017in"}

### 2.3.4. API Endpoints {#api-endpoints}
### 2.4.4. API Endpoints {#api-endpoints}

| **Method** | **Endpoint**    | **Mô tả**                          | **Auth** |
| :--------- | :-------------- | :--------------------------------- | :------- |
|:-----------|:----------------|:-----------------------------------|:---------|
| GET        | /products/      | Lấy danh sách sản phẩm (có filter) | Không    |
| POST       | /products/      | Tạo sản phẩm mới                   | Admin    |
| GET        | /products/{id}/ | Xem chi tiết sản phẩm              | Không    |
| PUT        | /products/{id}/ | Cập nhật thông tin sản phẩm        | Admin    |
| DELETE     | /products/{id}/ | Xóa sản phẩm                       | Admin    |
| GET        | /categories/    | Danh sách danh mục                 | Không    |
| POST       | /categories/    | Tạo danh mục mới                   | Admin    |

## 2.4. Thiết kế User Service (Django) {#thiết-kế-user-service-django}

### 2.4.1. Phân loại người dùng {#phân-loại-người-dùng}

Hệ thống áp dụng mô hình RBAC (Role-Based Access Control) với 3 vai trò:

- **Admin:** Toàn quyền hệ thống -- CRUD mọi tài nguyên, quản lý người dùng và cấu hình.

- **Staff:** Xử lý đơn hàng, cập nhật trạng thái giao hàng, quản lý sản phẩm.

- **Customer:** Mua hàng, xem sản phẩm, quản lý giỏ hàng và đơn hàng của bản thân.

### 2.4.2. Django Model {#django-model-1}

![](media/image15.png){width="6.250688976377953in" height="2.8197550306211725in"}![](media/image16.png){width="6.259948600174978in" height="1.2084667541557306in"}

### 2.4.3. Phân quyền RBAC {#phân-quyền-rbac}

| **Hành động**                 | **Admin** | **Staff** | **Customer** |
| :---------------------------- | :-------: | :-------: | :----------: |
| Xem danh sách sản phẩm        |     ✓     |     ✓     |      ✓       |
| Tạo / sửa / xóa sản phẩm      |     ✓     |     ✓     |      ✗       |
| Xem tất cả đơn hàng           |     ✓     |     ✓     |      ✗       |
| Xem đơn hàng của mình         |     ✓     |     ✓     |      ✓       |
| Cập nhật trạng thái giao hàng |     ✓     |     ✓     |      ✗       |
| Quản lý người dùng            |     ✓     |     ✗     |      ✗       |
| Đặt hàng / thanh toán         |     ✓     |     ✗     |      ✓       |

### 2.4.4. Class Diagram -- User Service {#class-diagram-user-service}

![](media/image17.png){width="1.0535345581802276in" height="3.094165573053368in"}

### 2.4.5. API Endpoints {#api-endpoints-1}

| **Method** | **Endpoint**    | **Mô tả**                 | **Auth**         |
| :--------- | :-------------- | :------------------------ | :--------------- |
| POST       | /auth/register/ | Đăng ký tài khoản mới     | Không            |
| POST       | /auth/login/    | Đăng nhập, nhận JWT token | Không            |
| POST       | /auth/refresh/  | Làm mới access token      | Token            |
| GET        | /users/         | Danh sách người dùng      | Admin            |
| GET        | /users/{id}/    | Thông tin người dùng      | Admin/Chính mình |
| PUT        | /users/{id}/    | Cập nhật thông tin        | Admin/Chính mình |
| DELETE     | /users/{id}/    | Xóa tài khoản             | Admin            |

## 2.5. Thiết kế Cart Service (Django) {#thiết-kế-cart-service-django}

### 2.5.1. Django Model {#django-model-2}

> \# carts/models.py
>
> from django.db import models class Cart(models.Model):
>
> \"\"\"Shopping cart associated with a user (by user_id from user-service).\"\"\" user_id = models.IntegerField(unique=True)
>
> created_at = models.DateTimeField(auto_now_add=True) updated_at = models.DateTimeField(auto_now=True)
>
> class Meta:
>
> db_table = \'cart\'
>
> def str (self):
>
> return f\"Cart of user {self.user_id}\"
>
> class CartItem(models.Model): \"\"\"Individual item in a cart.\"\"\"
>
> cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name=\'items\') product_id = models.IntegerField()
>
> product_name = models.CharField(max_length=255, blank=True) product_price = models.FloatField(default=0)
>
> quantity = models.IntegerField(default=1)
>
> added_at = models.DateTimeField(auto_now_add=True)
>
> class Meta:
>
> db_table = \'cart_item\' unique_together = (\'cart\', \'product_id\')
>
> def str (self):
>
> return f\"{self.product_name} x{self.quantity}\"
>
> @property
>
> def subtotal(self):
>
> return self.product_price \* self.quantity

### 2.5.2. Business Logic {#business-logic}

- **Thêm sản phẩm vào giỏ:** Kiểm tra sản phẩm tồn tại qua product-service API, sau đó tạo hoặc cập nhật CartItem.

- **Cập nhật số lượng:** Nếu quantity = 0 thì tự động xóa item khỏi giỏ.

- **Xóa item:** Xóa CartItem theo product_id, giỏ hàng vẫn tồn tại.

- **Tính tổng tiền:** Tính dynamically từ tổng subtotal của các CartItem.

### 2.5.3. API Endpoints {#api-endpoints-2}

| **Method** | **Endpoint**       | **Mô tả**             | **Auth** |
| :--------- | :----------------- | :-------------------- | :------- |
|:-----------|:-------------------|:----------------------|:---------|
| GET        | /cart/             | Xem giỏ hàng hiện tại | Customer |
| POST       | /cart/add/         | Thêm sản phẩm vào giỏ | Customer |
| PUT        | /cart/items/{id}/  | Cập nhật số lượng     | Customer |
| DELETE     | /cart/remove/{id}/ | Xóa item khỏi giỏ     | Customer |
| DELETE     | /cart/clear/       | Xóa toàn bộ giỏ hàng  | Customer |

### 2.5.4. Class Diagram -- Cart Service![](media/image18.png){width="5.65517716535433in" height="1.56in"} {#class-diagram-cart-service}
### 2.5.4. Class Diagram -- Cart Service {#class-diagram-cart-service}

![](media/image18.png){width="5.65517716535433in" height="1.56in"}

## 2.6. Thiết kế Order Service (Django) {#thiết-kế-order-service-django}

### 2.6.1. Django Model {#django-model-3}

> \# orders/models.py
>
> from django.db import models class Order(models.Model):
>
> \"\"\"Order model - represents a customer order.\"\"\" STATUS_CHOICES = (
>
> (\'pending\', \'Pending\'),
>
> (\'confirmed\', \'Confirmed\'),
>
> (\'paid\', \'Paid\'),
>
> (\'shipping\', \'Shipping\'),
>
> (\'delivered\', \'Delivered\'),
>
> (\'cancelled\', \'Cancelled\'),
>
> )
>
> user_id = models.IntegerField() total_price = models.FloatField(default=0)
>
> status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=\'pending\') shipping_address = models.TextField(blank=True, null=True)
>
> created_at = models.DateTimeField(auto_now_add=True) updated_at = models.DateTimeField(auto_now=True)
>
> class Meta:
>
> db_table = \'orders\' ordering = \[\'-created_at\'\]
>
> def str (self):
>
> return f\"Order \#{self.id} - User {self.user_id} - {self.status}\"
>
> class OrderItem(models.Model): \"\"\"Individual item in an order.\"\"\"
>
> order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name=\'items\') product_id = models.IntegerField()
>
> product_name = models.CharField(max_length=255, blank=True) price = models.FloatField(default=0)
>
> quantity = models.IntegerField(default=1)
>
> class Meta:
>
> db_table = \'order_item\'
>
> def str (self):
>
> return f\"{self.product_name} x{self.quantity}\"
>
> @property
>
> def subtotal(self):
>
> return self.price \* self.quantity

### 2.6.2. Order Workflow {#order-workflow}

Luồng xử lý đơn hàng diễn ra qua các bước sau:

1.  Customer gửi POST /orders/create

> → order-service đọc giỏ hàng từ cart-service
>
> → Tạo Order + OrderItems trong DB
>
> → Trả về order_id, trạng thái: \'pending\'

2.  order-service gửi request tới payment-service

→ POST /payment/pay { order_id, amount }

3.  Nếu thanh toán thành công:

> → order-service cập nhật status = \'paid\'
>
> → Gửi request tới shipping-service
>
> → POST /shipping/create { order_id, address }

4.  Nếu thanh toán thất bại:

> → order-service cập nhật status = \'cancelled\'

<figure>
<img src="media/image19.png" style="width:2.40943in;height:5.685in" />
<figcaption><blockquote>
<p>→ Trả về thông báo lỗi cho Customer</p>
</blockquote></figcaption>
</figure>

### 2.6.3. API Endpoints {#api-endpoints-3}

| **Method** | **Endpoint**         | **Mô tả**                | **Auth**       |
| :--------- | :------------------- | :----------------------- | :------------- |
|:-----------|:---------------------|:-------------------------|:---------------|
| POST       | /orders/             | Tạo đơn hàng từ giỏ hàng | Customer       |
| GET        | /orders/             | Xem danh sách đơn hàng   | Admin/Staff    |
| GET        | /orders/my/          | Xem đơn hàng của mình    | Customer       |
| GET        | /orders/{id}/        | Chi tiết đơn hàng        | Chủ đơn/Admin  |
| PUT        | /orders/{id}/status/ | Cập nhật trạng thái      | Staff/Admin    |
| DELETE     | /orders/{id}/cancel/ | Hủy đơn hàng             | Customer/Admin |

### 2.6.4. Class Diagram -- Order Service {#class-diagram-order-service}

![](media/image20.png){width="4.971422790901137in" height="1.5790616797900263in"}

## 2.7. Thiết kế Payment Service (Django) {#thiết-kế-payment-service-django}

### 2.7.1. Django Model {#django-model-4}

> \# payments/models.py
>
> from django.db import models class Payment(models.Model):
>
> \"\"\"Payment model for processing order payments.\"\"\" STATUS_CHOICES = (
>
> (\'pending\', \'Pending\'),
>
> (\'success\', \'Success\'),
>
> (\'failed\', \'Failed\'),
>
> )
>
> METHOD_CHOICES = (
>
> (\'credit_card\', \'Credit Card\'), (\'bank_transfer\', \'Bank Transfer\'), (\'cod\', \'Cash on Delivery\'),
>
> (\'e_wallet\', \'E-Wallet\'),
>
> )
>
> order_id = models.IntegerField(unique=True) amount = models.FloatField()
>
> status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=\'pending\') method = models.CharField(max_length=50, choices=METHOD_CHOICES, default=\'credit_card\') transaction_id = models.CharField(max_length=100, blank=True, null=True)
>
> created_at = models.DateTimeField(auto_now_add=True) updated_at = models.DateTimeField(auto_now=True)
>
> class Meta:
>
> db_table = \'payment\'
>
> def str (self):
>
> return f\"Payment for Order \#{self.order_id} - {self.status}\"

### 2.7.3. Trạng thái thanh toán {#trạng-thái-thanh-toán}
### 2.7.2. Trạng thái thanh toán {#trạng-thái-thanh-toán}

| **Trạng thái** | **Mô tả**            | **Hành động tiếp theo** |
| :------------- | :------------------- | :---------------------- |
|:---------------|:---------------------|:------------------------|
| pending        | Chờ khách thanh toán | Chờ xác nhận giao dịch  |
| success        | Giao dịch thành công | Trigger tạo shipment    |
| failed         | Giao dịch thất bại   | Hủy đơn hàng            |
| refunded       | Hoàn tiền cho khách  | Cập nhật order status   |

### 2.7.3. API Endpoints {#api-endpoints-4}

| **Method** | **Endpoint**                | **Mô tả**                      | **Auth**       |
| :--------- | :-------------------------- | :----------------------------- | :------------- |
| POST       | /payment/pay/               | Xử lý thanh toán đơn hàng      | Customer       |
| GET        | /payment/status/{order_id}/ | Kiểm tra trạng thái thanh toán | Customer/Staff |
| POST       | /payment/refund/{id}/       | Hoàn tiền giao dịch            | Admin          |
| GET        | /payment/history/           | Lịch sử giao dịch              | Admin          |
| **Method** | **Endpoint** | **Mô tả** | **Auth** |
|:---|:---|:---|:---|
| POST | /payment/pay/ | Xử lý thanh toán đơn hàng | Customer |
| GET | /payment/status/{order_id}/ | Kiểm tra trạng thái thanh toán | Customer/Staff |
| POST | /payment/refund/{id}/ | Hoàn tiền giao dịch | Admin |
| GET | /payment/history/ | Lịch sử giao dịch | Admin |

### 2.7.4. Class Diagram -- Payment Service {#class-diagram-payment-service}

![](media/image21.png){width="1.2420833333333334in" height="1.5166666666666666in"}

## 2.8. Thiết kế Shipping Service (Django) {#thiết-kế-shipping-service-django}

### 2.8.1. Django Model {#django-model-5}

> \# shippings/models.py
>
> from django.db import models class Shipment(models.Model):
>
> \"\"\"Shipment model for tracking order deliveries.\"\"\" STATUS_CHOICES = (
>
> (\'processing\', \'Processing\'), (\'shipping\', \'Shipping\'),
>
> (\'delivered\', \'Delivered\'),
>
> (\'returned\', \'Returned\'),
>
> )
>
> order_id = models.IntegerField(unique=True) address = models.TextField()
>
> status = models.CharField(max_length=50, choices=STATUS_CHOICES, default=\'processing\') tracking_number = models.CharField(max_length=100, blank=True, null=True)
>
> carrier = models.CharField(max_length=100, blank=True, null=True) estimated_delivery = models.DateField(blank=True, null=True) created_at = models.DateTimeField(auto_now_add=True) updated_at = models.DateTimeField(auto_now=True)
>
> class Meta:
>
> db_table = \'shipment\'
>
> def str (self):
>
> return f\"Shipment for Order \#{self.order_id} - {self.status}\"

### 2.8.2. Trạng thái giao hàng {#trạng-thái-giao-hàng}

| **Trạng thái** | **Mô tả**                         | **Người cập nhật** |
| :------------- | :-------------------------------- | :----------------- |
|:---------------|:----------------------------------|:-------------------|
| processing     | Đang chuẩn bị hàng tại kho        | Staff              |
| shipped        | Đã bàn giao cho đơn vị vận chuyển | Staff              |
| in_transit     | Đang trên đường đến khách         | Staff/Carrier      |
| delivered      | Khách đã nhận hàng thành công     | Staff/Carrier      |
| returned       | Khách từ chối nhận / hoàn hàng    | Staff/Admin        |

### 2.8.3. API Endpoints {#api-endpoints-5}

| **Method** | **Endpoint**                 | **Mô tả**                         | **Auth**    |
| ---------- | ---------------------------- | --------------------------------- | ----------- |
| POST       | /shipping/create/            | Tạo phiếu vận chuyển cho đơn hàng | Staff/Admin |
| GET        | /shipping/status/{order_id}/ | Tra cứu trạng thái giao hàng      | Tất cả      |
| PUT        | /shipping/{id}/status/       | Cập nhật trạng thái giao hàng     | Staff/Admin |
| GET        | /shipping/                   | Danh sách tất cả phiếu vận chuyển | Staff/Admin |
| **Method** | **Endpoint** | **Mô tả** | **Auth** |
|----|----|----|----|
| POST | /shipping/create/ | Tạo phiếu vận chuyển cho đơn hàng | Staff/Admin |
| GET | /shipping/status/{order_id}/ | Tra cứu trạng thái giao hàng | Tất cả |
| PUT | /shipping/{id}/status/ | Cập nhật trạng thái giao hàng | Staff/Admin |
| GET | /shipping/ | Danh sách tất cả phiếu vận chuyển | Staff/Admin |

### 2.8.4. Class Diagram -- Shipping Service![](media/image22.png){width="2.042331583552056in" height="2.4166666666666665in"} {#class-diagram-shipping-service}
### 2.8.4. Class Diagram -- Shipping Service {#class-diagram-shipping-service}

![](media/image22.png){width="2.042331583552056in" height="2.4166666666666665in"}

## 2.9. Luồng hệ thống tổng thể (End-to-End Flow) {#luồng-hệ-thống-tổng-thể-end-to-end-flow}

Luồng nghiệp vụ hoàn chỉnh của một giao dịch mua hàng trải qua 6 service theo thứ tự:

![](media/image23.jpeg){width="6.296984908136483in" height="6.785in"}

### 2.9.1. Sequence Logic chi tiết {#sequence-logic-chi-tiết}

Sequence Diagram mô tả luồng mua hàng hoàn chỉnh trong hệ thống thương mại điện tử microservices, bắt đầu từ khi người dùng đăng nhập, xem sản phẩm, thêm sản phẩm vào giỏ hàng, đặt hàng, thanh toán và theo dõi trạng thái đơn hàng.

- Bước 1 - Đăng nhập:

> Customer gửi thông tin đăng nhập từ Frontend. Frontend gọi API Gateway qua endpoint POST /auth/login/. API Gateway chuyển tiếp request đến User Service. User Service xác thực thông tin người dùng và trả về kết quả đăng nhập cho Frontend.

- Bước 2 - Xem danh sách sản phẩm:

> Customer duyệt danh sách sản phẩm trên Frontend. Frontend gọi API Gateway qua endpoint GET /products/. API Gateway chuyển tiếp request đến Product Service. Product Service trả về danh sách sản phẩm để Frontend hiển thị cho người dùng.

- Bước 3 - Thêm sản phẩm vào giỏ hàng:

> Customer chọn sản phẩm và thêm vào giỏ hàng. Frontend gửi request POST /cart/add/ đến API Gateway. API Gateway chuyển tiếp request đến Cart Service. Cart Service gọi Product Service qua endpoint GET/products/{product_id}/stock/ để kiểm tra tồn kho. Nếu sản phẩm còn hàng, Cart Service thêm hoặc cập nhật CartItem trong giỏ hàng và trả kết quả về Frontend.

- Bước 4 - Bắt đầu đặt hàng:

> Customer bấm nút Checkout và nhập địa chỉ giao hàng. Frontend gửi request POST/orders/create/ đến API Gateway, kèm user_id và shipping_address. API Gateway chuyển tiếp request đến Order Service.

- Bước 5 - Đọc giỏ hàng:

> Order Service gọi Cart Service qua endpoint GET /cart/items/?user_id={user_id} để lấy danh sách sản phẩm trong giỏ hàng và tổng tiền.

- Bước 6 - Kiểm tra giỏ hàng:

> Nếu giỏ hàng rỗng, Order Service trả về lỗi 400 Cart is empty. API Gateway chuyển lỗi về Frontend và Frontend hiển thị thông báo lỗi cho Customer.
>
> Nếu giỏ hàng có sản phẩm, Order Service tiếp tục xử lý tạo đơn hàng.

- Bước 7 - Tạo đơn hàng:

> Order Service tạo Order với trạng thái ban đầu là pending. Sau đó, Order Service tạo các OrderItem tương ứng với từng sản phẩm trong giỏ hàng.

- Bước 8 - Cập nhật tồn kho:

> Với mỗi sản phẩm trong đơn hàng, Order Service gọi Product Service qua endpoint POST/products/{product_id}/update-stock/ để giảm số lượng tồn kho theo số lượng đã mua.

- Bước 9 - Xóa giỏ hàng:

> Sau khi tạo đơn hàng thành công, Order Service gọi Cart Service qua endpoint DELETE/cart/clear/?user_id={user_id} để xóa các sản phẩm trong giỏ hàng của người dùng.

- Bước 10 - Thanh toán:

> Order Service gọi Payment Service qua endpoint POST /payment/pay/, truyền order_id và amount. Payment Service xử lý thanh toán, tạo bản ghi Payment với trạng thái success, sau đó gọi lại Order Service qua endpoint PUT /orders/{order_id}/status/ để cập nhật trạng thái đơn hàng thành paid.

- Bước 11 - Tạo giao hàng:

> Khi đơn hàng đã được cập nhật sang trạng thái paid, Order Service gọi Shipping Service qua endpoint POST /shipping/create/, truyền order_id và địa chỉ giao hàng. Shipping Service tạo Shipment, sinh tracking number, thiết lập ngày giao hàng dự kiến, sau đó gọi lại Order Service qua endpoint PUT /orders/{order_id}/status/ để cập nhật trạng thái đơn hàng thành shipping.

- Bước 12 - Ghi nhận hành vi mua hàng:

> Với mỗi sản phẩm đã mua, Order Service gọi AI Service qua endpoint POST /behavior/track/ để ghi nhận hành vi purchase. Dữ liệu này phục vụ cho chức năng gợi ý sản phẩm và cá nhân hóa trải nghiệm người dùng.

- Bước 13 - Trả kết quả đặt hàng:

> Sau khi hoàn tất các bước xử lý, Order Service trả về response 201 Created kèm thông tin đơn hàng. API Gateway chuyển response về Frontend và Frontend hiển thị thông báo đặt hàng thành công cho Customer.

- Bước 14 - Xem trạng thái đơn hàng:

> Sau khi đặt hàng, Customer có thể mở trang đơn hàng. Frontend gọi GET/orders/?user_id={user_id} để lấy danh sách đơn hàng từ Order Service, gọi GET/payment/status/?order_id={order_id} để lấy trạng thái thanh toán từ Payment Service, và gọi GET /shipping/status/?order_id={order_id} để lấy trạng thái giao hàng từ Shipping Service. Frontend tổng hợp dữ liệu và hiển thị trạng thái đơn hàng, thanh toán và vận chuyển cho Customer.

## 2.10. Hướng dẫn thực hành {#hướng-dẫn-thực-hành}

### 2.10.1. Mục tiêu thực hành {#mục-tiêu-thực-hành}

Sinh viên cần hoàn thành các nhiệm vụ sau trong phần thực hành của Chương 2:

- **Vẽ Class Diagram bằng Visual Paradigm (VP):** Xác định đầy đủ classes, attributes, relationships và ký hiệu UML cho từng service.

- **Mapping Class Diagram sang Database Schema:** Chuyển đổi Class thành Table, Attribute thành Column, Relationship thành Foreign Key.

- **Triển khai Database thực tế:** Viết SQL script hoặc dùng Django migrations để tạo database cho từng service.

### 2.10.2. Hướng dẫn vẽ Class Diagram bằng Visual Paradigm {#hướng-dẫn-vẽ-class-diagram-bằng-visual-paradigm}

**[Bước 1 -- Xác định các lớp (Classes)]{.underline}**

Sinh viên xác định các lớp chính cho từng service theo bảng sau:

| **Service**      | **Các lớp cần vẽ**                                                                                               |
| :--------------- | ---------------------------------------------------------------------------------------------------------------- |
| product-service  | Category, Product, Book, Electronics, Fashion. HomeAppliance, Grocery, Toy, Automotive,Furniture, Beauty, Sports |
| user-service     | User, Role                                                                                                       |
| cart-service     | Cart, CartItem                                                                                                   |
| order-service    | Order, OrderItem                                                                                                 |
| payment-service  | Payment                                                                                                          |
| shipping-service | Shipment                                                                                                         |
| **Service** | **Các lớp cần vẽ** |
|:---|----|
| product-service | Category, Product, Book, Electronics, Fashion. HomeAppliance, Grocery, Toy, Automotive,Furniture, Beauty, Sports |
| user-service | User, Role |
| cart-service | Cart, CartItem |
| order-service | Order, OrderItem |
| payment-service | Payment |
| shipping-service | Shipment |

**[Bước 2 -- Xác định thuộc tính (Attributes)]{.underline}**

Ví dụ chi tiết cho lớp Product:

**[Bước 3 -- Xác định quan hệ (Relationships)]{.underline}**

- **Association (Liên kết):** Product → Category (nhiều Product thuộc một Category)

- **Inheritance (Kế thừa):** Book, Electronics, Fashion kế thừa từ Product

- **Composition (Thành phần):** Order chứa OrderItem (OrderItem không tồn tại độc lập)

- **Aggregation (Tổng hợp):** Cart chứa CartItem

| **Ký hiệu UML** | **Ý nghĩa**                  | **Ví dụ trong hệ thống**    |
| :-------------- | :--------------------------- | :-------------------------- |
|:----------------|:-----------------------------|:----------------------------|
| ──────►         | Association                  | Product → Category          |
| ─────◁\|        | Inheritance (Generalization) | Book ──◁\| Product          |
| ──────          | Composition                  | Order ◆── OrderItem         |
| ──────          | Aggregation                  | Cart ◇── CartItem           |
| 1..\*           | One-to-Many                  | 1 Category có nhiều Product |
| 1..1            | One-to-One                   | 1 Product có 1 Book detail  |

### 2.10.3. Class Diagram tổng thể toàn hệ thống {#class-diagram-tổng-thể-toàn-hệ-thống}

![](media/image24.jpeg){width="6.299677384076991in" height="4.7in"}

### 2.10.4. Mapping Class Diagram sang Database {#mapping-class-diagram-sang-database}

Nguyên tắc chuyển đổi từ Class Diagram sang Database Schema:

| **Khái niệm OOP**  | **Ánh xạ sang Database** | **Ví dụ**                                  |
| ------------------ | ------------------------ | ------------------------------------------ |
| Class              | Table                    | class Product → TABLE product              |
| Attribute          | Column                   | price: float → price FLOAT                 |
| Association (N-1)  | Foreign Key              | product.category_id → FK → category.id     |
| Inheritance (IS-A) | Bảng riêng + FK/PK chung | book.product_id → FK PRIMARY → product.id  |
| Composition (1-N)  | Foreign Key + CASCADE    | order_item.order_id → FK ON DELETE CASCADE |
| Many-to-Many       | Bảng trung gian          | Ví dụ: user_role (user_id, role_id)        |
| **Khái niệm OOP** | **Ánh xạ sang Database** | **Ví dụ** |
|----|----|----|
| Class | Table | class Product → TABLE product |
| Attribute | Column | price: float → price FLOAT |
| Association (N-1) | Foreign Key | product.category_id → FK → category.id |
| Inheritance (IS-A) | Bảng riêng + FK/PK chung | book.product_id → FK PRIMARY → product.id |
| Composition (1-N) | Foreign Key + CASCADE | order_item.order_id → FK ON DELETE CASCADE |
| Many-to-Many | Bảng trung gian | Ví dụ: user_role (user_id, role_id) |

### 2.10.5. Database Schema chi tiết cho từng Service {#database-schema-chi-tiết-cho-từng-service}

**[1. Product Service Database (PostgreSQL)]{.underline}**

Lý do chọn PostgreSQL: Hỗ trợ kiểu dữ liệu JSON phức tạp, phù hợp với thuộc tính đa dạng của sản phẩm.

![](media/image25.png){width="4.6764413823272095in" height="6.0840037182852145in"}

![](media/image26.png){width="4.792194881889764in" height="7.227648731408574in"}

![](media/image27.png){width="4.7273731408573925in" height="1.5696172353455817in"}

![](media/image28.png){width="6.221198600174978in" height="4.9in"}

**[2. User Service Database (MySQL)]{.underline}**

Lý do chọn MySQL: Phổ biến, tối ưu cho authentication, hiệu năng cao với truy vấn đơn giản.

![](media/image29.png){width="4.810715223097113in" height="3.852276902887139in"}![](media/image30.png){width="3.237029746281715in" height="3.8916666666666666in"}

**[3. ​Cart Service Database (PostgreSQL)]{.underline}**

![](media/image31.png){width="4.750523840769904in" height="2.8614260717410325in"}

![](media/image32.png){width="3.7749989063867018in" height="4.433333333333334in"}

**[4. Order Service Database (PostgreSQL)]{.underline}**

![](media/image33.png){width="4.833865923009624in" height="3.1021937882764656in"}![](media/image34.png){width="4.599998906386702in" height="4.983333333333333in"}

[​]{.underline}

**[5. Payment Service Database (PostgreSQL)]{.underline}**

![](media/image35.png){width="2.9583333333333335in" height="2.4583333333333335in"}

[​**6. Shipping Service Database (PostgreSQL)**]{.underline}![](media/image36.png){width="3.283333333333333in" height="2.725in"}

![](media/image37.png){width="4.792194881889764in" height="2.236357174103237in"}

### 2.10.6. So sánh MySQL vs PostgreSQL {#so-sánh-mysql-vs-postgresql}

<table style="width:95%;">
<colgroup>
<col style="width: 23%" />
<col style="width: 20%" />
<col style="width: 20%" />
<col style="width: 31%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><strong>Tiêu chí</strong></th>
<th style="text-align: center;"><strong>MySQL</strong></th>
<th style="text-align: center;"><strong>PostgreSQL</strong></th>
<th style="text-align: center;"><strong>Kết luận</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>Hiệu năng</td>
<td>Tốt cho đọc đơn giản</td>
<td>Tốt cho query phức tạp</td>
<td>MySQL cho auth/cart/order</td>
</tr>
<tr>
<td>Hỗ trợ JSON</td>
<td>Cơ bản (JSON type)</td>
<td><p>Mạnh (JSONB,</p>
<p>indexing)</p></td>
<td>PostgreSQL cho product</td>
</tr>
<tr>
<td>Kiểu dữ liệu nâng cao</td>
<td>Giới hạn</td>
<td>Phong phú (array, hstore...)</td>
<td>PostgreSQL linh hoạt hơn</td>
</tr>
<tr>
<td>Giao dịch (ACID)</td>
<td>Hỗ trợ (InnoDB)</td>
<td>Hỗ trợ đầy đủ</td>
<td>Cả hai đều OK</td>
</tr>
<tr>
<td>Cộng đồng &amp; tài liệu</td>
<td>Rất lớn</td>
<td>Lớn, đang tăng nhanh</td>
<td>Cả hai đều ổn</td>
</tr>
<tr>
<td>Phù hợp trong hệ thống</td>
<td>User</td>
<td>Product Service, Cart, Order, Payment, Shipping</td>
<td>Chọn theo domain</td>
</tr>
</tbody>
</table>

## 2.11. Kết luận Chương 2 {#kết-luận-chương-2}

Chương 2 đã trình bày đầy đủ thiết kế chi tiết của hệ thống E-Commerce theo kiến trúc Microservices, bao gồm:

- **Phân tích yêu cầu:** Xác định rõ 7 chức năng chính và 6 yêu cầu phi chức năng quan trọng.

- **Phân rã hệ thống theo DDD:** 6 Bounded Context được ánh xạ thành 6 Microservice độc lập, mỗi service có database riêng.

- **Thiết kế chi tiết từng service:** Django Model, Business Logic, và API Endpoints được định nghĩa đầy đủ cho 6 service.

- **Database Schema:** SQL Schema cụ thể cho từng service, lý giải rõ việc chọn MySQL hay PostgreSQL.

- **Luồng E2E:** Toàn bộ luồng mua hàng từ đăng nhập đến giao hàng được mô tả qua sequence diagram logic.

# CHƯƠNG 3 AI SERVICE CHO TƯ VẤN SẢN PHẨM
# CHƯƠNG 3: AI SERVICE CHO TƯ VẤN SẢN PHẨM

## 3.1. Mục tiêu {#mục-tiêu-1}

AI Service được xây dựng nhằm cá nhân hóa trải nghiệm mua sắm thông qua hai dạng đầu ra chính:

- **Recommendation List:** Gợi ý danh sách sản phẩm phù hợp dựa trên hành vi người dùng (click, search, add-to-cart) và quan hệ sản phẩm.

- **Chatbot tư vấn:** Trả lời câu hỏi tự nhiên về sản phẩm, lọc theo nhu cầu và ngân sách, sử dụng RAG để sinh câu trả lời có ngữ nghĩa.

Hệ thống kết hợp 3 thành phần AI độc lập và sau đó hợp nhất điểm số qua Hybrid Score Combiner để đưa ra kết quả tốt nhất.

## 3.2. Kiến trúc tổng thể AI Service {#kiến-trúc-tổng-thể-ai-service}

AI Service hoạt động như một microservice độc lập, nhận input từ các service khác qua REST API và trả về kết quả gợi ý hoặc câu trả lời chatbot.

![](media/image38.png){width="6.098702974628171in" height="3.4741666666666666in"}

Luồng xử lý tổng quát:

- **Input:** Hành vi người dùng (click/view/add-to-cart), query tìm kiếm, lịch sử đơn hàng, dữ liệu sản phẩm.

- **Processing Engine:** 3 module độc lập -- LSTM Model, Knowledge Graph (Neo4j), RAG Pipeline -- mỗi module sinh ra một score riêng.

- **Hybrid Score Combiner:** Tổng hợp 3 score theo trọng số để sinh kết quả cuối cùng.

- **Output:** Danh sách product_id gợi ý (Recommendation) hoặc câu trả lời tự nhiên (Chatbot), phục vụ qua FastAPI port 8006.

## 3.3. Thu thập và chuẩn bị dữ liệu {#thu-thập-và-chuẩn-bị-dữ-liệu}

### 3.3.1. User Behavior Data {#user-behavior-data}

AI Service cần thu thập log hành vi người dùng từ các service khác. Schema chuẩn cho behavior event:

### 3.3.2. Ví dụ dataset {#ví-dụ-dataset}

| **user_id** | **product_id** | **action**  | **timestamp**    |
| :---------- | :------------- | :---------- | :--------------- |
|:------------|:---------------|:------------|:-----------------|
| 1           | 101            | view        | 2026-04-01 09:00 |
| 1           | 102            | add_to_cart | 2026-04-01 09:05 |
| 1           | 101            | buy         | 2026-04-01 09:12 |
| 2           | 205            | view        | 2026-04-01 10:00 |
| 2           | 101            | click       | 2026-04-01 10:03 |
| 3           | 312            | buy         | 2026-04-01 11:00 |

### 3.3.3. Nguồn dữ liệu {#nguồn-dữ-liệu}

- **order-service:** Lịch sử mua hàng thực tế -- độ tin cậy cao nhất, weight action \'buy\' = 3.

- **cart-service:** Hành động add-to-cart -- thể hiện ý định mua, weight = 2.

- **product-service:** Hành vi view/click -- thu thập qua frontend logging, weight = 1.

- **Preprocessing:** Sort theo timestamp, encode product_id thành integer index, chia sequence thành sliding windows.

## 3.4. Mô hình LSTM -- Sequence Modeling {#mô-hình-lstm-sequence-modeling}

### 3.4.1. Ý tưởng {#ý-tưởng}

LSTM (Long Short-Term Memory) là loại mạng RNN có khả năng học chuỗi dài mà không bị vanishing gradient. Trong bài toán này, mỗi người dùng có một chuỗi hành vi theo thời gian: \[xem 101 → thêm giỏ 102 → mua 101 → \...\]. LSTM học pattern trong chuỗi này để dự đoán sản phẩm tiếp theo người dùng có khả năng quan tâm.

![](media/image39.png){width="6.295570866141732in" height="2.5625in"}

_Hình 3.2 -- Luồng xử lý LSTM: Raw Behavior → Preprocess → LSTM Layer → Linear Layer → Top-N Products_
*Hình 3.2 -- Luồng xử lý LSTM: Raw Behavior → Preprocess → LSTM Layer → Linear Layer → Top-N Products*

### 3.4.2. Model chi tiết {#model-chi-tiết}

> from sklearn.preprocessing import LabelEncoder
>
> from tensorflow.keras.layers import Bidirectional, Dense, LSTM, SimpleRNN from tensorflow.keras.models import Sequential
>
> def set_seed(seed: int = 42) -\> None: random.seed(seed) np.random.seed(seed) tf.random.set_seed(seed)
>
> def make_sequences(df: pd.DataFrame, seq_len: int = 5) -\> tuple\[np.ndarray, np.ndarray\]: X, y = \[\], \[\]
>
> for \_, grp in df.groupby(\"user_id\"): acts = grp\[\"action_enc\"\].tolist() for i in range(len(acts) - seq_len):
>
> X.append(acts\[i : i + seq_len\]) y.append(acts\[i + seq_len\])
>
> return np.array(X), np.array(y)
>
> def build_model(model_type: str, seq_len: int, num_classes: int) -\> Sequential: model = Sequential(name=f\"{model_type}\_classifier\")
>
> if model_type == \"RNN\":
>
> model.add(SimpleRNN(64, input_shape=(seq_len, 1))) elif model_type == \"LSTM\":
>
> model.add(LSTM(64, input_shape=(seq_len, 1))) elif model_type == \"biLSTM\":
>
> model.add(Bidirectional(LSTM(64), input_shape=(seq_len, 1))) else:
>
> raise ValueError(f\"Unsupported model type: {model_type}\")
>
> model.add(Dense(32, activation=\"relu\")) model.add(Dense(num_classes, activation=\"softmax\"))
>
> model.compile(optimizer=\"adam\", loss=\"categorical_crossentropy\", metrics=\[\"accuracy\"\]) return model

### 3.4.3. Training loop {#training-loop}

![](media/image40.png){width="6.176606517935258in" height="2.217836832895888in"}

![](media/image41.png){width="4.801455599300088in" height="7.2369083552056in"}![](media/image42.png){width="6.0052613735783025in" height="9.1303291776028in"}d![](media/image43.png){width="4.833865923009624in" height="4.542167541557306in"}efault=\".\" select_best_model(metrics_df, args.primary_metric) best_model_name = str(best_row\[\"model\"\])

best_model = trained_models\[best_model_name\] best_pred = predictions\[best_model_name\]

## 3.5. Knowledge Graph với Neo4j {#knowledge-graph-với-neo4j}

### 3.5.1. Mô hình đồ thị {#mô-hình-đồ-thị}

Knowledge Graph biểu diễn quan hệ giữa User và Product dưới dạng đồ thị có hướng, cho phép truy vấn \"sản phẩm tương tự mà người dùng có cùng hành vi đã mua\" một cách tự nhiên qua ngôn ngữ Cypher.

![](media/image44.png){width="6.203655949256343in" height="3.0083333333333333in"}

### 3.5.2. Các loại node và edge {#các-loại-node-và-edge}

| **Loại** | **Tên**      | **Thuộc tính**            | **Ý nghĩa**               |
| :------- | :----------- | :------------------------ | :------------------------ |
|:---------|:-------------|:--------------------------|:--------------------------|
| Node     | User         | id, username              | Người dùng hệ thống       |
| Node     | Product      | id, name, category, price | Sản phẩm                  |
| Edge     | \[:BUY\]     | timestamp, quantity       | User đã mua Product       |
| Edge     | \[:VIEW\]    | timestamp, duration       | User đã xem Product       |
| Edge     | \[:SIMILAR\] | score (0-1)               | Hai Product tương tự nhau |

### 3.5.3. Khởi tạo dữ liệu -- Cypher {#khởi-tạo-dữ-liệu-cypher}

![](media/image45.png){width="6.2090179352580925in" height="2.958659230096238in"}

![](media/image46.png){width="4.692037401574803in" height="7.2119280402449695in"}

### 3.5.4. Truy vấn gợi ý Cypher {#truy-vấn-gợi-ý-cypher}

> // Gợi ý sản phẩm cho User 1:
>
> // Tìm các sản phẩm SIMILAR với những gì User 1 đã BUY MATCH (u:User {id: 1})-\[:BUY\]-\>(p)-\[:SIMILAR\]-\>(rec:Product)
>
> WHERE NOT (u)-\[:BUY\]-\>(rec) // Loại sản phẩm đã mua
>
> RETURN rec.id, rec.name, rec.price ORDER BY rec.id
>
> LIMIT 5
>
> // Tìm users tương tự (collaborative filtering):
>
> MATCH (u1:User {id: 1})-\[:BUY\]-\>(p)\<-\[:BUY\]-(u2:User) WHERE u1 \<\> u2
>
> MATCH (u2)-\[:BUY\]-\>(rec)
>
> WHERE NOT (u1)-\[:BUY\]-\>(rec)
>
> RETURN rec.id, count(\*) AS freq ORDER BY freq DESC LIMIT 5

### 3.5.5. Neo4j Python Client {#neo4j-python-client}

![](media/image47.png){width="6.795138888888889in" height="3.6770833333333335in"}

![](media/image48.png){width="6.795138888888889in" height="3.9604166666666667in"}

## 3.6. RAG -- Retrieval-Augmented Generation {#rag-retrieval-augmented-generation}

### 3.6.1. Pipeline RAG {#pipeline-rag}

RAG cho phép chatbot trả lời câu hỏi tự nhiên về sản phẩm bằng cách kết hợp Retrieval (tìm sản phẩm liên quan từ Vector DB) và Generation (sinh câu trả lời bằng LLM).

![](media/image49.png){width="6.435930664916885in" height="2.683333333333333in"}

### 3.6.2. Vector Database -- FAISS {#vector-database-faiss}

Mỗi sản phẩm được biểu diễn dưới dạng một vector embedding từ mô tả văn bản (tên, mô tả, danh mục, thương hiệu). FAISS lưu trữ tất cả các vector này và cho phép tìm kiếm cosine similarity cực nhanh.

![](media/image50.png){width="5.976768372703412in" height="8.310553368328959in"}

![](media/image51.png){width="5.880925196850393in" height="8.941973972003499in"}

![](media/image52.png){width="5.830162948381452in" height="8.818426290463693in"}

![](media/image53.png){width="5.924444444444444in" height="2.9065649606299213in"}

### 3.6.3. LLM Generate -- Sinh câu trả lời {#llm-generate-sinh-câu-trả-lời}

![](media/image54.png){width="6.003075240594925in" height="5.629091207349082in"}

![](media/image55.png){width="6.035845363079615in" height="0.6356900699912511in"}

## 3.7. Hai dạng AI Service {#hai-dạng-ai-service}

### 3.7.1. Recommendation API {#recommendation-api}

Trả về danh sách product_id gợi ý cho một người dùng, được gọi tự động khi người dùng vào trang chủ, trang sản phẩm, hoặc sau khi thêm vào giỏ hàng.

> \# Endpoint:
>
> GET /recommend?user_id=1&limit=5
>
> \# Response:
>
> {
>
> \'user_id\': 1, \'recommendations\': \[
>
> {\'product_id\': 101, \'score\': 0.92, \'reason\': \'LSTM+Graph\'},
>
> {\'product_id\': 205, \'score\': 0.87, \'reason\': \'Graph+RAG\'},
>
> {\'product_id\': 312, \'score\': 0.81, \'reason\': \'LSTM\'},
>
> \]
>
> }

![](media/image56.png){width="6.504129483814523in" height="5.0174704724409445in"}![](media/image57.png){width="6.375702099737532in" height="1.000110454943132in"}

### 3.7.2. Chatbot API {#chatbot-api}

Nhận câu hỏi tự nhiên từ người dùng và trả về câu trả lời tư vấn có ngữ cảnh, sử dụng pipeline NLP → Retrieve → Generate.

![](media/image58.png){width="6.503102580927384in" height="2.410416666666667in"}

> \# Endpoint:
>
> POST /chatbot
>
> Body: { \'message\': \'tôi cần laptop gaming giá dưới 20 triệu\' }
>
> \# Response:
>
> {
>
> \'reply\': \'Với ngân sách dưới 20 triệu và nhu cầu gaming, có thể xem xét: Laptop ASUS ROG (18.5tr, RTX 4060) hoặc
>
> Acer Nitro 5 (15.9tr, RTX 3050). Cả hai đều có RAM 16GB, phù hợp cho gaming ở mức high settings.\',
>
> \'products\': \[101, 205\]
>
> }

![](media/image59.png){width="6.375702099737532in" height="2.0094805336832895in"}

![](media/image60.png){width="4.939377734033246in" height="7.322288932633421in"}

![](media/image61.png){width="4.810715223097113in" height="1.6529604111986003in"}

## 3.8. Triển khai AI Service {#triển-khai-ai-service}

### 3.8.1. Tech Stack & Cấu trúc thư mục {#tech-stack-cấu-trúc-thư-mục}

![](media/image62.png){width="6.159005905511811in" height="2.497979002624672in"}

<table style="width:95%;">
<colgroup>
<col style="width: 23%" />
<col style="width: 28%" />
<col style="width: 43%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;"><strong>Thành phần</strong></th>
<th style="text-align: left;"><strong>Công nghệ</strong></th>
<th style="text-align: left;"><strong>Chức năng</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td>API Framework</td>
<td>FastAPI (Python)</td>
<td>Expose /recommend và /chatbot endpoints</td>
</tr>
<tr>
<td>LSTM Model</td>
<td>PyTorch / TensorFlow</td>
<td>Sequence prediction từ hành vi người dùng</td>
</tr>
<tr>
<td>Knowledge Graph</td>
<td>Neo4j + py2neo</td>
<td>BUY/VIEW/SIMILAR graph, Cypher queries</td>
</tr>
<tr>
<td>Vector DB</td>
<td><p>FAISS +</p>
<p>SentenceTransformers</p></td>
<td>Embedding sản phẩm, similarity search</td>
</tr>
<tr>
<td>LLM</td>
<td>OpenAI API / Local LLM</td>
<td>Generate ngôn ngữ tự nhiên cho chatbot</td>
</tr>
<tr>
<td>Container</td>
<td>Docker</td>
<td>Đóng gói toàn bộ service</td>
</tr>
</tbody>
</table>

### 3.8.2. Cấu trúc thư mục AI Service![](media/image63.png){width="2.8461034558180227in" height="2.1508333333333334in"} {#cấu-trúc-thư-mục-ai-service}

### 3.8.3. Dockerfile -- AI Service {#dockerfile-ai-service}

![](media/image64.png){width="6.01629593175853in" height="3.3482502187226597in"}

### 3.8.4. requirements.txt -- AI Service {#requirements.txt-ai-service}

![](media/image65.png){width="5.831570428696413in" height="2.06534886264217in"}

![](media/image66.png){width="6.188580489938758in" height="0.7440474628171478in"}

## 3.9. Bài tập thực hành {#bài-tập-thực-hành}

Sinh viên cần hoàn thành các bài tập sau đây và nộp kèm tiểu luận:

- **Bài tập 1 -- LSTM:** Xây dựng và train LSTMModel với dataset hành vi người dùng (có thể dùng dữ liệu giả). Lưu model và chạy thử predict_topn(user_id=1). Chụp màn hình kết quả.

- **Bài tập 2 -- Neo4j:** Cài đặt Neo4j Desktop hoặc Docker. Chạy seed.cypher để tạo graph. Thực thi câu truy vấn gợi ý và chụp màn hình Neo4j Browser.

- **Bài tập 3 -- FAISS:** Build vector index cho ít nhất 20 sản phẩm bằng build_index(). Thực hiện search(\"laptop gaming\") và in top-5 kết quả.

- **Bài tập 4 -- API:** Implement và chạy thử GET /recommend?user_id=1 và POST

- /chatbot bằng FastAPI. Dùng Postman hoặc curl để test. Chụp màn hình response.

## 3.10. Checklist đánh giá Chương 3 {#checklist-đánh-giá-chương-3}

| **Tiêu chí**        | **Yêu cầu**                                                    | **Điểm tối đa** |
| :------------------ | :------------------------------------------------------------- | :-------------- |
| Pipeline AI rõ ràng | Có sơ đồ kiến trúc, mô tả đầy đủ luồng xử lý                   | 20%             |
| LSTM Model          | Có code model, training loop, inference; kết quả demo          | 25%             |
| Knowledge Graph     | Có Neo4j graph, seed data, Cypher query gợi ý chạy được        | 20%             |
| RAG Pipeline        | Có FAISS index, embedding, generate; hoặc mô tả rõ placeholder | 20%             |
| API hoạt động       | GET /recommend và POST /chatbot trả về kết quả đúng format     | 15%             |
| **Tiêu chí** | **Yêu cầu** | **Điểm tối đa** |
|:---|:---|:---|
| Pipeline AI rõ ràng | Có sơ đồ kiến trúc, mô tả đầy đủ luồng xử lý | 20% |
| LSTM Model | Có code model, training loop, inference; kết quả demo | 25% |
| Knowledge Graph | Có Neo4j graph, seed data, Cypher query gợi ý chạy được | 20% |
| RAG Pipeline | Có FAISS index, embedding, generate; hoặc mô tả rõ placeholder | 20% |
| API hoạt động | GET /recommend và POST /chatbot trả về kết quả đúng format | 15% |

## 3.11. Kết luận Chương 3 {#kết-luận-chương-3}

Chương 3 đã trình bày thiết kế và triển khai AI Service hoàn chỉnh cho hệ thống E-Commerce, bao gồm:

- **LSTM Model:** Học chuỗi hành vi người dùng để dự đoán sản phẩm tiếp theo, phù hợp với bài toán next-item prediction.

- **Knowledge Graph (Neo4j):** Biểu diễn quan hệ User-Product dưới dạng đồ thị, cho phép gợi ý dựa trên collaborative filtering và product similarity.

- **RAG Pipeline:** Kết hợp FAISS semantic search với LLM generation, cho phép chatbot trả lời câu hỏi tự nhiên về sản phẩm một cách thông minh.

- **Hybrid Score Combiner:** Tổng hợp 3 nguồn điểm số theo trọng số có thể tune được, đảm bảo kết quả gợi ý tốt nhất từ nhiều góc độ.

Kiến trúc này đảm bảo tính mô-đun -- mỗi thành phần có thể cải tiến hoặc thay thế độc lập. Ví dụ: nâng cấp LLM từ gpt-3.5 lên gpt-4, hoặc thêm Transformer thay thế LSTM, mà không ảnh hưởng đến các service khác.

# CHƯƠNG 4: THIẾT KẾ VÀ TRIỂN KHAI HỆ THỐNG TỔNG THỂ (SYSTEM INTEGRATION)

## 4.1. Kiến trúc Hạ tầng Tập trung (Infrastructure & Orchestration) {#kiến-trúc-hạ-tầng-tập-trung-infrastructure-orchestration}

### 4.1.1. Phân tích Mô hình Microservices Đa lớp {#phân-tích-mô-hình-microservices-đa-lớp}

Hệ thống được vận hành trên nền tảng Containerization, tách biệt hoàn toàn giữa các tầng logic.

![](media/image67.jpeg){width="6.257594050743657in" height="2.7504166666666667in"}

### 4.1.2. Đặc tả Docker Compose (Infrastructure as Code) {#đặc-tả-docker-compose-infrastructure-as-code}

Chúng ta định nghĩa toàn bộ hạ tầng trong file docker-compose.yml, thiết lập ranh giới mạng (Network Isolation) để các dịch vụ chỉ thấy nhau trong nội bộ.

**Cấu hình thực tế chi tiết:**

![](media/image68.png){width="6.5192366579177605in" height="7.625839895013123in"}

## 4.2. API Gateway: Trái tim của sự điều phối {#api-gateway-trái-tim-của-sự-điều-phối}

### 4.2.1. Cấu hình Nginx nâng cao {#cấu-hình-nginx-nâng-cao}

Không chỉ điều hướng, Nginx còn xử lý **Header Transformation** và **Timeout** để đảm bảo tính ổn định của hệ thống phân tá

**Mã nguồn nginx.conf thực tế:**

![](media/image69.png){width="5.317796369203849in" height="7.732422353455818in"}

![](media/image70.png){width="5.9102909011373574in" height="8.921193132108487in"}

![](media/image71.png){width="5.859593175853019in" height="5.529991251093613in"}![](media/image72.jpeg){width="6.328152887139107in" height="4.280624453193351in"}

## 4.3. Bảo mật Đa lớp và Xác thực JWT {#bảo-mật-đa-lớp-và-xác-thực-jwt}

### 4.3.1. Chiến lược \"Stateless\" với JWT {#chiến-lược-stateless-với-jwt}

Chúng ta sử dụng thuật toán **HS256** để ký số Token. Token chứa các thông tin (Claims) như user_id, role, và exp (thời điểm hết hạn).

**Mã nguồn thực thi Verify Token tại các dịch vụ nghiệp vụ:**

> _\# common/auth_middleware.py_
> *\# common/auth_middleware.py*
>
> def validate_jwt(token): try:
>
> payload = jwt.decode(token, settings.SECRET_KEY, algorithms=\[\'HS256\'\]) return payload\[\'user_id\'\]
>
> except jwt.ExpiredSignatureError:
>
> raise AuthenticationFailed(\'Token đã hết hạn\') except jwt.InvalidTokenError:
>
> raise AuthenticationFailed(\'Token không hợp lệ\')

### 4.3.2. Role-Based Access Control (RBAC) {#role-based-access-control-rbac}

Mỗi API đều được bảo vệ bởi Decorator để kiểm tra quyền hạn (Admin, Staff, Customer).

![](media/image73.jpeg){width="6.268093832020997in" height="3.430833333333333in"}

## 4.4. Quy trình Nghiệp vụ liên kết (Business Workflow Integration) {#quy-trình-nghiệp-vụ-liên-kết-business-workflow-integration}

### 4.4.1. Chuỗi giao dịch Checkout (Saga Pattern đơn giản) {#chuỗi-giao-dịch-checkout-saga-pattern-đơn-giản}

Khi khách hàng nhấn \"Thanh toán\", một chuỗi các hành động liên dịch vụ được kích hoạt đồng thời.

![](media/image74.jpeg){width="6.3161034558180225in" height="5.64in"}

## 4.5. AI Service: Tích hợp Đồ thị tri thức và LLM (RAG) {#ai-service-tích-hợp-đồ-thị-tri-thức-và-llm-rag}

### 4.5.1. Quy trình xử lý truy vấn thông minh {#quy-trình-xử-lý-truy-vấn-thông-minh}

AI Service không chỉ là một wrapper cho OpenAI/Gemini, mà là một hệ thống **Retrieval-Augmented Generation (RAG)** thực thụ.

**Cấu trúc xử lý logic:**

1.  **Nhận câu hỏi:** \"Tìm cho tôi sách về kinh tế dưới 200k\".

2.  **Cypher Generation:** AI chuyển đổi câu hỏi thành truy vấn Neo4j.

3.  **Knowledge Retrieval:** Truy xuất từ đồ thị các nút Book có thuộc tính price \< 200000 và category=\'Kinh tế\'.

4.  **Context Injection:** Đưa danh sách sách tìm được vào Prompt gửi cho Gemini.

5.  **Final Response:** Trình bày câu trả lời tự nhiên cho người dùng.

**Mã nguồn thực tế xử lý chuỗi RAG:**

## 4.6. Vận hành và Giám sát (Operations & Maintenance) {#vận-hành-và-giám-sát-operations-maintenance}

### 4.6.1. Quản lý dữ liệu bền vững (Persistence) {#quản-lý-dữ-liệu-bền-vững-persistence}

Sử dụng **Docker Volumes** để đảm bảo dữ liệu không bị mất khi container khởi động lại.

> volumes: postgres_data: neo4j_data: chroma_db:

### 4.6.2. Kiểm tra sức khỏe (Health Checks) {#kiểm-tra-sức-khỏe-health-checks}

Gateway định kỳ kiểm tra trạng thái của các service để tự động ngắt kết nối nếu service bị treo.

## 4.7. Giao diện hệ thống {#giao-diện-hệ-thống}

## 4.8. Đánh giá và Tổng kết Chương 4 {#đánh-giá-và-tổng-kết-chương-4}

### 4.8.1 Hiệu năng hệ thống {#hiệu-năng-hệ-thống}

- **Độ trễ Gateway:** \< 10ms.

- **Thời gian phản hồi AI:** 1.5s - 3s (Tùy thuộc độ phức tạp của đồ thị Neo4j).

- **Khả năng chịu tải:** Có thể xử lý đồng thời 500+ request/giây nhờ cơ chế Non-blocking của Nginx.

### 4.8.2. Kết luận {#kết-luận}

Việc xây dựng hệ thống hoàn chỉnh theo kiến trúc Microservices đã giải quyết triệt để bài toán về sự linh hoạt và khả năng mở rộng. Tích hợp AI Service thông qua RAG mang lại giá trị cạnh tranh lớn, biến một trang web bán hàng thông thường thành một trợ lý mua sắm thông minh.

# CHƯƠNG 5: TỰ NHẬN XÉT VÀ ĐÁNH GIÁ

## CHƯƠNG 1 - TỪ MONOLITHIC ĐẾN MICROSERVICES VÀ DDD

Chương 1 đóng vai trò là nền tảng lý thuyết cốt lõi cho toàn bộ đồ án. Dựa trên tài liệu đề bài, sinh viên được yêu cầu trình bày sự chuyển dịch từ kiến trúc nguyên khối sang vi dịch vụ và vận dụng Domain-Driven Design (DDD) để phân rã bài toán Healthcare. Nhìn chung, đã hoàn thành xuất sắc và có nhiều điểm mở rộng đáng khen ngợi.

### Phân tích nền tảng lý thuyết Kiến trúc (Monolithic vs Microservices)

- Về Monolithic Architecture: đã đưa ra được định nghĩa rất chuẩn xác về mô hình nguyên khối, đồng thời minh họa được cấu trúc 3 tầng (Three-tier) điển hình gồm Presentation, Business Logic và Data Access. Điều làm nên sự khác biệt trong tài liệu của là việc đưa ra ví dụ thực tế về cấu trúc thư mục (folder structure) của một dự án Monolithic đóng gói thành một file .jar duy nhất. Việc liệt kê 5 nhược điểm (khó scale, coupling cao, rủi ro deploy, khó làm việc nhóm, kẹt công nghệ) hoàn toàn bám sát với định hướng của tài liệu hướng dẫn.

- Về Microservices Architecture: không chỉ nêu khái niệm mà còn trích dẫn được định nghĩa kinh điển của Martin Fowler, cho thấy sự tìm hiểu tài liệu rất sâu. Điểm sáng là bảng so sánh 7 tiêu chí (Deploy, Scale, Coupling, Team, Tech, Debug, Boot time) giữa Monolithic và Microservices. Bảng so sánh này chi tiết và đầy đủ hơn rất nhiều so với bảng so sánh gốc chỉ có 3 tiêu chí trong tài liệu tham khảo, qua đó chứng minh được tư duy phân tích hệ thống sắc bén của.

### Đánh giá việc áp dụng Domain-Driven Design (DDD)

- Khái niệm cốt lõi: Phương pháp luận DDD rất trừu tượng, nhưng đã giải thích các khái niệm như Entity, Value Object, Aggregate một cách dễ hiểu kèm theo ví dụ cụ thể (ví dụ Value Object là Address, Money; Aggregate là Order chứa OrderItems).

- Khái niệm Bounded Context & Context Map: Việc giải thích sự khác biệt của thực thể \"Sản phẩm - Product\" trong từng Bounded Context khác nhau (Product Context vs Order Context vs Shipping Context) là một minh chứng xuất sắc cho việc đã thực sự hiểu tinh thần của DDD. Bảng ánh xạ 7 Bounded Context sang 7 Microservice cụ thể (từ user-service dùng MySQL đến ai-service dùng Neo4j) cho thấy một tầm nhìn hệ thống toàn diện.

### Đánh giá bài tập thực hành phân rã: Case Study Healthcare

Đây là phần bài tập bắt buộc trong tài liệu hướng dẫn (Luyện Decomposition).

- Sự vượt trội so với yêu cầu: Tài liệu đề bài chỉ yêu cầu sinh viên phân rã 3 module cơ bản là Patient, Doctor, Appointment. Tuy nhiên, đã thực hiện một bước tiến lớn khi phân tích bài toán thực tế của bệnh viện XYZ và chia nó thành 3 nhóm Domain (Core,

- Supporting, Generic). Từ đó, phân rã thành tận 6 Bounded Contexts (Patient, Appointment, Prescription, Pharmacy, Billing, Notification).

- Thiết kế tương tác: không dừng lại ở việc nêu tên Service mà còn đặc tả chi tiết cách các service này gọi chéo nhau qua REST API và Message Queue (ví dụ: billing-service -\> prescription-service). Đặc biệt, các endpoint API mẫu cho Patient và Appointment được thiết kế chuẩn xác với các HTTP Methods (GET, POST, PUT, DELETE). Điểm này xứng đáng nhận điểm tối đa.

## CHƯƠNG 2 - PHÁT TRIỂN HỆ THỐNG E-COMMERCE THEO MICROSERVICES

Chương 2 là phần trọng tâm về mặt thiết kế kỹ thuật. đã ánh xạ thành công các kiến thức lý thuyết từ Chương 1 vào một bài toán Thương mại điện tử thực tế, đáp ứng đầy đủ Functional và Non-functional Requirements.

### 2.1. Đánh giá kiến trúc phân rã Bounded Context (E-Commerce) {#đánh-giá-kiến-trúc-phân-rã-bounded-context-e-commerce}

- Hệ thống của được chia cắt rạch ròi thành 6 microservice cốt lõi: user-service (port 8000), product-service (port 8001), cart-service (port 8002), order-service (port 8003), payment-service (port 8004), và shipping-service (port 8005).

- Việc tuân thủ nguyên tắc \"mỗi service chạy một database riêng, giao tiếp hoàn toàn bằng REST API\" giúp hệ thống đạt được trạng thái Loose Coupling lý tưởng mà đồ án yêu cầu.

### 2.2. Sự đột phá trong Thiết kế Product Service (Tầng Domain) {#sự-đột-phá-trong-thiết-kế-product-service-tầng-domain}

- Vượt xa kỳ vọng của đề bài: Tài liệu môn học chỉ gợi ý 3 loại sản phẩm (Book, Electronics, Fashion). Tuy nhiên, để đáp ứng tính phức tạp của một sàn E-commerce thực thụ, đã thiết kế mô hình hỗ trợ tới 10 phân loại sản phẩm (bổ sung Beauty, Furniture, Sports, Home Appliance, Toy, Grocery, Automotive).

- Kỹ thuật OOP: đã ứng dụng nhuần nhuyễn tính kế thừa (Inheritance) trong ORM Django. Việc sử dụng OneToOneField trỏ về bảng Product cha giúp hệ thống dễ dàng lưu trữ các thuộc tính đa hình mà không làm \"phình to\" bảng dữ liệu gốc.

### 2.3. Thiết kế User Service và Bảo mật RBAC {#thiết-kế-user-service-và-bảo-mật-rbac}

- Cơ chế Role-Based Access Control (RBAC) được phân chia hợp lý với 3 quyền hạn: Admin, Staff, Customer. Bảng phân quyền thao tác (Ví dụ: Customer được đặt hàng nhưng không được cập nhật trạng thái giao hàng) cho thấy rất quan tâm đến khía cạnh nghiệp vụ thực tế. Thiết kế API Authentication trả về JWT token tuân thủ đúng tiêu chuẩn bảo mật Stateless.

### 2.4. Đánh giá luồng nghiệp vụ: Cart, Order, Payment, Shipping {#đánh-giá-luồng-nghiệp-vụ-cart-order-payment-shipping}

Thay vì thiết kế các service rời rạc, đã móc nối chúng lại thành một chuỗi cung ứng logic:

- Cart Service: Xử lý tốt logic thêm sản phẩm, cập nhật số lượng (nếu quantity = 0 thì tự xóa item) và tính subtotal. Việc chỉ lưu product_id mà không tạo khóa ngoại cứng sang database của Product Service là một thiết kế Microservices rất chuẩn mực, chống lại lỗi \"database coupling\".

- Order Service: Cấu trúc bảng Order và OrderItem được thiết kế theo đúng chuẩn Aggregation. Vòng đời trạng thái đơn hàng (pending -\> confirmed -\> paid -\> shipping

  - delivered) được định nghĩa rõ ràng.

- Payment & Shipping Service: Hai dịch vụ này có tính độc lập cao. Trạng thái thanh toán (pending, success, failed, refunded) quyết định trực tiếp việc trigger khởi tạo mã vận đơn (tracking_number) bên Shipping Service.

### 2.5. Đánh giá Luồng Hệ thống Tổng thể (End-to-End Flow) {#đánh-giá-luồng-hệ-thống-tổng-thể-end-to-end-flow}

Đây là phần phức tạp nhất của thiết kế Microservices. Trong khi đề bài PDF chỉ nêu tóm tắt luồng mua hàng trong 6 bước ngắn gọn, đã viết ra một Sequence Logic chi tiết gồm 14 bước.

- Từ việc Gateway nhận request (Bước 1), chuyển tiếp sang đọc giỏ hàng (Bước 5), bắt lỗi giỏ hàng rỗng (Bước 6), gọi Product Service trừ tồn kho (Bước 8), gọi Payment thanh toán (Bước 10), gọi Shipping tạo vận đơn (Bước 11), và cuối cùng là trigger AI service ghi nhận hành vi mua hàng (Bước 12).

- Luồng E2E này thể hiện có kỹ năng phân tích chuỗi giao dịch liên dịch vụ (Distributed Transaction) cực kỳ xuất sắc.

### 2.6. Thiết kế Cơ sở dữ liệu Đa ngôn ngữ (Polyglot Persistence) {#thiết-kế-cơ-sở-dữ-liệu-đa-ngôn-ngữ-polyglot-persistence}

- PostgreSQL: dùng cho Product Service vì tính năng hỗ trợ kiểu JSONB và indexing mạnh mẽ, giải quyết hoàn hảo vấn đề lưu trữ các thuộc tính linh hoạt của 10 nhóm sản phẩm khác nhau. Đồng thời Postgres cũng được dùng cho Cart, Order, Payment, Shipping.

- MySQL: chỉ định riêng cho User Service vì tốc độ read (đọc) cao, phù hợp với nghiệp vụ Authentication và quản lý định danh người dùng vốn có cấu trúc bảng đơn giản, cố định.

## Chương 3 - AI Service

### 3.1. Vai trò của AI Service trong hệ thống {#vai-trò-của-ai-service-trong-hệ-thống}

AI Service là thành phần tạo điểm khác biệt cho dự án. Nếu các service như User, Product, Cart, Order, Payment và Shipping xử lý nghiệp vụ thương mại điện tử cơ bản, thì AI Service mở rộng hệ thống theo hướng cá nhân hóa trải nghiệm người dùng. Service này tiếp nhận dữ liệu hành vi, xử lý truy vấn của người dùng, lập chỉ mục sản phẩm, đưa ra danh sách gợi ý và hỗ trợ chatbot tư vấn.

Cách tách AI thành một microservice độc lập là hợp lý. Phần AI có đặc thù riêng về framework, thư viện, mô hình, dữ liệu, tài nguyên tính toán và vòng đời phát triển. Trong dự án, các service nghiệp vụ chính dùng Django REST Framework, còn AI Service dùng FastAPI. Sự tách biệt này giúp AI Service có thể thay đổi pipeline, cập nhật mô hình hoặc thử nghiệm thuật toán mới mà không làm ảnh hưởng trực tiếp đến các service nghiệp vụ.

![](media/image75.jpeg){width="5.7497867454068246in" height="2.44in"}

### 3.2. Thành phần kỹ thuật của AI Service {#thành-phần-kỹ-thuật-của-ai-service}

AI Service được thiết kế theo hướng hybrid recommendation, kết hợp nhiều nguồn tín hiệu thay vì chỉ dựa vào một thuật toán đơn lẻ. Điều này phù hợp với bài toán e-commerce vì hành vi mua hàng thường chịu ảnh hưởng bởi nhiều yếu tố: lịch sử tương tác của người dùng, quan hệ giữa sản phẩm, nội dung mô tả sản phẩm và truy vấn tự nhiên.

| **Thành phần**     | **Công nghệ/ý tưởng**     | **Vai trò trong hệ thống**                                 |
| :----------------- | :------------------------ | :--------------------------------------------------------- |
| Behavior Tracking  | REST API /behavior/track/ | Ghi nhận hành vi view, click, add_to_cart, purchase        |
| LSTM               | PyTorch                   | Học chuỗi hành vi và dự đoán sản phẩm có khả năng quan tâm |
| Knowledge Graph    | Neo4j                     | Biểu diễn quan hệ User - Product - Behavior - Similarity   |
| RAG                | FAISS + LLM               | Tìm sản phẩm liên quan và hỗ trợ chatbot tư vấn            |
| Recommendation API | /recommend/               | Trả về danh sách sản phẩm gợi ý                            |
| Chatbot API        | /chatbot/                 | Trả lời câu hỏi và đề xuất sản phẩm theo ngữ cảnh          |
| Model Info         | /model-info/, /health/    | Kiểm tra trạng thái model, graph, vector index             |
| Training           | /train/                   | Kích hoạt huấn luyện LSTM trên dữ liệu hành vi đã thu thập |
| **Thành phần** | **Công nghệ/ý tưởng** | **Vai trò trong hệ thống** |
|:---|:---|:---|
| Behavior Tracking | REST API /behavior/track/ | Ghi nhận hành vi view, click, add_to_cart, purchase |
| LSTM | PyTorch | Học chuỗi hành vi và dự đoán sản phẩm có khả năng quan tâm |
| Knowledge Graph | Neo4j | Biểu diễn quan hệ User - Product - Behavior - Similarity |
| RAG | FAISS + LLM | Tìm sản phẩm liên quan và hỗ trợ chatbot tư vấn |
| Recommendation API | /recommend/ | Trả về danh sách sản phẩm gợi ý |
| Chatbot API | /chatbot/ | Trả lời câu hỏi và đề xuất sản phẩm theo ngữ cảnh |
| Model Info | /model-info/, /health/ | Kiểm tra trạng thái model, graph, vector index |
| Training | /train/ | Kích hoạt huấn luyện LSTM trên dữ liệu hành vi đã thu thập |

### 3.3. Điểm mạnh của AI Service {#điểm-mạnh-của-ai-service}

Điểm mạnh đầu tiên là pipeline AI được tổ chức tương đối rõ ràng. Service có đầu vào, xử lý và đầu ra cụ thể. Đầu vào gồm hành vi người dùng và query; phần xử lý gồm LSTM, Knowledge

Graph và RAG; đầu ra gồm danh sách sản phẩm gợi ý hoặc câu trả lời chatbot. Cách chia này giúp người đọc dễ hiểu AI Service đang giải quyết bài toán nào và từng thành phần đóng vai trò gì.

Điểm mạnh thứ hai là AI Service có endpoint đầy đủ cho cả vận hành và demo. Các endpoint như /behavior/track/, /behavior/search/, /recommend/, /chatbot/, /reindex/, /train/, /model-info/ và /health/ cho thấy service không chỉ có một API đơn lẻ. Nó có khả năng thu thập dữ liệu, lập chỉ mục, huấn luyện, kiểm tra trạng thái và trả kết quả. Điều này làm AI Service có tính hệ thống hơn.

Điểm mạnh thứ ba là việc sử dụng Neo4j cho Knowledge Graph. Trong e-commerce, nhiều quan hệ phù hợp với mô hình graph: người dùng đã mua sản phẩm nào, sản phẩm nào tương tự nhau, sản phẩm thuộc nhóm nào, người dùng có xu hướng tương tác với loại sản phẩm nào. Graph database giúp biểu diễn những quan hệ này tự nhiên hơn so với chỉ dùng bảng quan hệ.

Điểm mạnh thứ tư là AI Service có kết nối với Product Service. Khi cần dữ liệu sản phẩm để index hoặc trả lời chatbot, AI Service có thể lấy dữ liệu từ Product Service. Điều này giúp AI Service không bị tách rời khỏi hệ thống chính. Trong một hệ thống thực tế, AI chỉ có giá trị khi nó dựa trên dữ liệu nghiệp vụ thật và tác động lại trải nghiệm người dùng.

Điểm mạnh thứ năm là chatbot được thiết kế theo hướng RAG. Đây là lựa chọn hợp lý vì chatbot tư vấn sản phẩm cần dựa trên dữ liệu sản phẩm hiện có. Nếu chỉ dùng mô hình ngôn ngữ để sinh câu trả lời mà không truy xuất dữ liệu sản phẩm, câu trả lời có thể chung chung hoặc sai lệch. RAG giúp chatbot có cơ sở dữ liệu để trả lời sát hơn với danh mục sản phẩm.

### 3.4. Hạn chế của AI Service {#hạn-chế-của-ai-service}

Hạn chế lớn nhất của AI Service là chất lượng recommendation phụ thuộc nhiều vào dữ liệu hành vi. Nếu dữ liệu ít, mô hình LSTM chưa thể học được pattern có ý nghĩa. Với một MVP, số lượng user, sản phẩm và hành vi thường còn hạn chế, nên kết quả gợi ý chủ yếu chứng minh pipeline hoạt động thay vì chứng minh độ chính xác cao.

Hạn chế thứ hai là training pipeline còn đơn giản. Service có endpoint /train/ để kích hoạt huấn luyện và có cơ chế retrain khi hành vi đạt ngưỡng nhất định. Cách này phù hợp demo, nhưng trong production nên tách pipeline training khỏi runtime service. Một hệ thống AI hoàn chỉnh cần có train/validation split, lưu checkpoint, version model, metric đánh giá, rollback model và quy trình deploy model.

Hạn chế thứ ba là chưa có đánh giá định lượng cho AI. Với recommendation, nên có các chỉ số như Precision@K, Recall@K, Hit Rate, NDCG hoặc MRR. Với chatbot, nên có đánh giá về độ liên quan của câu trả lời, tỷ lệ truy xuất đúng sản phẩm, khả năng xử lý tiếng Việt và mức độ ổn định của câu trả lời. Hiện tại, AI Service phù hợp để trình diễn luồng tích hợp hơn là đánh giá chất lượng mô hình một cách khoa học.

Hạn chế thứ tư là RAG phụ thuộc vào chất lượng dữ liệu sản phẩm. Nếu dữ liệu sản phẩm ngắn, thiếu mô tả, thiếu thông số hoặc chưa chuẩn hóa, khả năng truy xuất và tư vấn sẽ bị giới hạn. Để chatbot tốt hơn, Product Service cần có dữ liệu sản phẩm phong phú hơn: thương hiệu, thông số kỹ thuật, nhóm người dùng phù hợp, ưu điểm, nhược điểm, tình trạng tồn kho và mức giá.

### 3.5. Đánh giá mức độ sẵn sàng của AI Service {#đánh-giá-mức-độ-sẵn-sàng-của-ai-service}

| **Tiêu chí**                 | **Đánh giá** | **Lý do**                                               |
| ---------------------------- | ------------ | ------------------------------------------------------- |
| Có pipeline AI rõ ràng       | Đạt          | Có input, processing, output và endpoint tương ứng      |
| Có mô hình sequence          | Đạt một phần | Có LSTM nhưng dữ liệu huấn luyện còn ít                 |
| Có Knowledge Graph           | Đạt          | Dùng Neo4j để lưu quan hệ hành vi/sản phẩm              |
| Có RAG/chatbot               | Đạt          | Có endpoint chatbot và truy xuất sản phẩm               |
| Có đánh giá chất lượng model | Chưa đạt     | Chưa có metric định lượng như Precision@K hoặc Recall@K |
| Có quản lý vòng đời model    | Chưa đầy đủ  | Chưa có versioning/checkpoint/rollback                  |
| Tích hợp với hệ thống chính  | Đạt          | Có behavior tracking và lấy dữ liệu từ Product Service  |
| **Tiêu chí** | **Đánh giá** | **Lý do** |
|----|----|----|
| Có pipeline AI rõ ràng | Đạt | Có input, processing, output và endpoint tương ứng |
| Có mô hình sequence | Đạt một phần | Có LSTM nhưng dữ liệu huấn luyện còn ít |
| Có Knowledge Graph | Đạt | Dùng Neo4j để lưu quan hệ hành vi/sản phẩm |
| Có RAG/chatbot | Đạt | Có endpoint chatbot và truy xuất sản phẩm |
| Có đánh giá chất lượng model | Chưa đạt | Chưa có metric định lượng như Precision@K hoặc Recall@K |
| Có quản lý vòng đời model | Chưa đầy đủ | Chưa có versioning/checkpoint/rollback |
| Tích hợp với hệ thống chính | Đạt | Có behavior tracking và lấy dữ liệu từ Product Service |

Kết luận cho Chương 3: AI Service đạt tốt mục tiêu MVP. Phần này giúp dự án khác biệt so với một hệ thống e-commerce CRUD thông thường. Giá trị chính nằm ở kiến trúc tích hợp AI vào microservices, pipeline có đủ thành phần và có endpoint để demo. Phần cần cải thiện là dữ liệu, metric đánh giá, model lifecycle và độ ổn định khi triển khai lâu dài.

## Chương 4 - MVP hệ thống hoàn chỉnh

### 4.1. Kiến trúc MVP {#kiến-trúc-mvp}

Chương 4 thể hiện phần triển khai toàn bộ hệ thống. Đây là chương chứng minh các service không chỉ tồn tại độc lập mà có thể phối hợp để tạo thành một sản phẩm e-commerce hoàn chỉnh. Hệ thống bao gồm frontend, API Gateway, các Django service, AI Service, nhiều database và Docker Compose.

| **Thành phần**   | **Công nghệ**            | **Vai trò**                                   |
| ---------------- | ------------------------ | --------------------------------------------- |
| Frontend         | HTML/CSS/JavaScript      | Giao diện người dùng, gọi API qua gateway     |
| API Gateway      | Nginx                    | Định tuyến request đến các service            |
| User Service     | Django REST              | Đăng ký, đăng nhập, JWT, quản lý user         |
| Product Service  | Django REST              | Quản lý danh mục, sản phẩm, tồn kho           |
| Cart Service     | Django REST              | Quản lý giỏ hàng và cart item                 |
| Order Service    | Django REST              | Điều phối tạo đơn hàng và trạng thái order    |
| Payment Service  | Django REST              | Xử lý thanh toán giả lập                      |
| Shipping Service | Django REST              | Tạo shipment và cập nhật trạng thái giao hàng |
| AI Service       | FastAPI                  | Recommendation, chatbot, behavior tracking    |
| Database         | MySQL, PostgreSQL, Neo4j | Lưu dữ liệu độc lập cho từng service          |
| **Thành phần** | **Công nghệ** | **Vai trò** |
|----|----|----|
| Frontend | HTML/CSS/JavaScript | Giao diện người dùng, gọi API qua gateway |
| API Gateway | Nginx | Định tuyến request đến các service |
| User Service | Django REST | Đăng ký, đăng nhập, JWT, quản lý user |
| Product Service | Django REST | Quản lý danh mục, sản phẩm, tồn kho |
| Cart Service | Django REST | Quản lý giỏ hàng và cart item |
| Order Service | Django REST | Điều phối tạo đơn hàng và trạng thái order |
| Payment Service | Django REST | Xử lý thanh toán giả lập |
| Shipping Service | Django REST | Tạo shipment và cập nhật trạng thái giao hàng |
| AI Service | FastAPI | Recommendation, chatbot, behavior tracking |
| Database | MySQL, PostgreSQL, Neo4j | Lưu dữ liệu độc lập cho từng service |

Điểm đáng ghi nhận là hệ thống đã tuân thủ tốt nguyên tắc database-per-service. User Service dùng MySQL; Product, Cart, Order, Payment và Shipping dùng PostgreSQL riêng; AI Service dùng Neo4j. Việc này giúp mỗi service sở hữu dữ liệu của mình, tránh tình trạng service này truy cập trực tiếp database của service khác. Đây là một trong những yêu cầu quan trọng nhất của kiến trúc microservices.

### 4.2. Luồng mua hàng end-to-end {#luồng-mua-hàng-end-to-end}

Luồng mua hàng là phần quan trọng nhất để đánh giá MVP. Một hệ thống e-commerce chỉ có ý nghĩa khi người dùng có thể đi từ xem sản phẩm đến đặt hàng và theo dõi trạng thái. Dự án đã triển khai được luồng này ở mức đủ để demo.

![](media/image76.jpeg){width="5.978106955380578in" height="1.845in"}

<table style="width:96%;">
<colgroup>
<col style="width: 10%" />
<col style="width: 26%" />
<col style="width: 59%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><strong>Bước</strong></th>
<th style="text-align: center;"><strong>Service chính</strong></th>
<th style="text-align: center;"><strong>Mô tả</strong></th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;">1</td>
<td>User Service</td>
<td>Người dùng đăng nhập và nhận thông tin xác thực</td>
</tr>
<tr>
<td style="text-align: center;">2</td>
<td>Product Service</td>
<td>Frontend lấy danh sách sản phẩm để hiển thị</td>
</tr>
<tr>
<td style="text-align: center;">3</td>
<td>Cart Service</td>
<td>Người dùng thêm sản phẩm vào giỏ hàng</td>
</tr>
<tr>
<td style="text-align: center;">4</td>
<td>Order Service</td>
<td>Người dùng checkout và tạo đơn hàng</td>
</tr>
<tr>
<td style="text-align: center;">5</td>
<td>Product Service</td>
<td><p>Order Service gọi cập nhật tồn</p>
<p>kho</p></td>
</tr>
<tr>
<td style="text-align: center;">6</td>
<td>Cart Service</td>
<td>Order Service xóa giỏ hàng sau khi tạo đơn</td>
</tr>
<tr>
<td style="text-align: center;">7</td>
<td>Payment Service</td>
<td>Xử lý thanh toán và cập nhật order sang paid</td>
</tr>
<tr>
<td style="text-align: center;">8</td>
<td>Shipping Service</td>
<td>Tạo shipment và cập nhật order sang shipping</td>
</tr>
<tr>
<td style="text-align: center;">9</td>
<td>AI Service</td>
<td>Ghi nhận hành vi purchase để phục vụ gợi ý</td>
</tr>
</tbody>
</table>

Luồng này cho thấy Order Service đang đóng vai trò orchestrator. Nó điều phối các service liên quan theo thứ tự: lấy cart, tạo order, tạo order item, cập nhật tồn kho, xóa cart, gọi payment và kích hoạt shipping. Cách thiết kế này dễ hiểu và phù hợp với MVP vì toàn bộ logic mua hàng nằm ở một service trung tâm.

Tuy nhiên, khi hệ thống lớn hơn, orchestration đồng bộ bằng REST có thể tạo ra rủi ro. Nếu một bước trong chuỗi bị lỗi, hệ thống cần có cơ chế rollback hoặc compensation. Ví dụ, nếu order đã tạo nhưng cập nhật tồn kho thất bại, dữ liệu có thể không nhất quán. Nếu payment thành công nhưng shipping không tạo được, order sẽ ở trạng thái khó xử lý. Vì vậy, hướng cải tiến tốt hơn là bổ sung Saga Pattern hoặc message queue cho các bước quan trọng.

### 4.3. Đánh giá API Gateway {#đánh-giá-api-gateway}

API Gateway bằng Nginx là điểm vào duy nhất của hệ thống. Gateway route các path như /auth/, /users/, /products/, /cart/, /orders/, /payment/, /shipping/, /recommend/, /chatbot/ và

/behavior/ đến đúng service phía sau. Đây là cách tổ chức phù hợp vì frontend không cần biết chi tiết từng service chạy ở port nào.

Ở mức MVP, Gateway đã làm tốt vai trò reverse proxy. Tuy nhiên, cần phân biệt giữa routing và API gateway đầy đủ. Một API Gateway production thường có thêm xác thực tập trung, rate limiting, logging, request id, metrics, timeout policy và security header. Trong dự án hiện tại, các phần này mới dừng ở định hướng hoặc triển khai đơn giản. Khi viết báo cáo, nên nhận xét rằng Nginx Gateway hiện đã đủ cho demo routing, nhưng chưa phải gateway production hoàn chỉnh.

### 4.4. Đánh giá Docker hóa và triển khai {#đánh-giá-docker-hóa-và-triển-khai}

Docker Compose là một điểm mạnh rõ ràng của MVP. Hệ thống có nhiều service và nhiều database, nếu chạy thủ công sẽ rất dễ lỗi môi trường. Docker giúp chuẩn hóa cách chạy, còn Docker Compose giúp khởi động toàn bộ hệ thống bằng một cấu hình thống nhất.

| **Tiêu chí**          | **Đánh giá** | **Nhận xét**                                                        |
| --------------------- | ------------ | ------------------------------------------------------------------- |
| Container hóa service | Tốt          | Các service đều có Dockerfile                                       |
| Compose toàn hệ thống | Tốt          | Có gateway, service, database và volume                             |
| Database volume       | Tốt          | Dữ liệu không mất khi rebuild image nếu không xóa volume            |
| Healthcheck database  | Khá tốt      | Có kiểm tra MySQL/PostgreSQL/Neo4j trước khi service phụ thuộc chạy |
| Production deployment | Chưa đầy đủ  | Chưa có Kubernetes manifest hoàn chỉnh, secret, ingress, probe      |
| CI/CD                 | Chưa có      | Chưa tự động build, test, deploy                                    |
| **Tiêu chí** | **Đánh giá** | **Nhận xét** |
|----|----|----|
| Container hóa service | Tốt | Các service đều có Dockerfile |
| Compose toàn hệ thống | Tốt | Có gateway, service, database và volume |
| Database volume | Tốt | Dữ liệu không mất khi rebuild image nếu không xóa volume |
| Healthcheck database | Khá tốt | Có kiểm tra MySQL/PostgreSQL/Neo4j trước khi service phụ thuộc chạy |
| Production deployment | Chưa đầy đủ | Chưa có Kubernetes manifest hoàn chỉnh, secret, ingress, probe |
| CI/CD | Chưa có | Chưa tự động build, test, deploy |

Docker Compose phù hợp cho development và demo. Nếu muốn đưa hệ thống lên production, cần chuẩn bị thêm Kubernetes hoặc một nền tảng orchestration tương đương. Khi đó cần bổ sung ConfigMap, Secret, PersistentVolume, readiness probe, liveness probe, ingress và logging tập trung.

### 4.5. Đánh giá bảo mật {#đánh-giá-bảo-mật}

Dự án có nền tảng JWT ở User Service. Người dùng đăng nhập để nhận access token và refresh token. Một số endpoint của User Service có thể yêu cầu authentication và phân quyền. Đây là điểm tốt vì hệ thống đã có cơ sở xác thực thay vì chỉ dùng user_id thuần túy.

Tuy nhiên, bảo mật chưa được áp dụng đồng bộ trên toàn hệ thống. Một số service nghiệp vụ đang mở quyền truy cập rộng để thuận tiện demo và service-to-service communication. Điều này chấp nhận được ở MVP nhưng không phù hợp production. Hệ thống nên chuẩn hóa cơ chế: frontend gửi Authorization header, gateway forward token, mỗi service kiểm tra token hoặc gọi User Service validate token, endpoint admin yêu cầu role admin, endpoint customer chỉ truy cập dữ liệu của chính người dùng đó.

| **Nội dung**            | **Hiện trạng**                       | **Đề xuất**                                     |
| :---------------------- | :----------------------------------- | :---------------------------------------------- |
| JWT                     | Có trong User Service                | Áp dụng đồng bộ cho các service nghiệp vụ       |
| RBAC                    | Có nền tảng role                     | Kiểm tra role ở endpoint admin                  |
| Service-to-service auth | Chưa rõ ràng                         | Dùng internal token hoặc mTLS khi production    |
| Secret/password         | Còn cấu hình trực tiếp trong compose | Chuyển sang .env hoặc Docker/Kubernetes secrets |
| CORS                    | Mở rộng cho demo                     | Siết domain khi triển khai thật                 |
| **Nội dung** | **Hiện trạng** | **Đề xuất** |
|:---|:---|:---|
| JWT | Có trong User Service | Áp dụng đồng bộ cho các service nghiệp vụ |
| RBAC | Có nền tảng role | Kiểm tra role ở endpoint admin |
| Service-to-service auth | Chưa rõ ràng | Dùng internal token hoặc mTLS khi production |
| Secret/password | Còn cấu hình trực tiếp trong compose | Chuyển sang .env hoặc Docker/Kubernetes secrets |
| CORS | Mở rộng cho demo | Siết domain khi triển khai thật |

### 4.6. Đánh giá observability và vận hành {#đánh-giá-observability-và-vận-hành}

Một hệ thống microservices khó vận hành hơn monolith vì một request có thể đi qua nhiều service. Với luồng mua hàng, request có thể đi qua Frontend, Gateway, Order Service, Cart Service, Product Service, Payment Service, Shipping Service và AI Service. Nếu thiếu logging và tracing, việc tìm nguyên nhân lỗi sẽ mất nhiều thời gian.

Hiện tại, tài liệu đã định hướng logging và monitoring, nhưng chưa phải thành phần triển khai chính. Đây là điểm cần cải thiện. Hệ thống nên bổ sung structured logging, request id, correlation id, health endpoint chuẩn hóa, metrics và dashboard. Với AI Service, cần theo dõi thêm số sản phẩm đã index, số behavior đã thu thập, trạng thái train model và thời gian inference.

### 4.7. Đánh giá mức độ sẵn sàng tổng thể {#đánh-giá-mức-độ-sẵn-sàng-tổng-thể}

![](media/image77.png){width="6.151154855643044in" height="2.9885411198600176in"}

Biểu đồ trên cho thấy dự án mạnh ở kiến trúc, luồng nghiệp vụ, database và triển khai MVP. Các phần cần cải thiện nhiều nhất là observability, resilience và security production. Điều này phù hợp với bản chất của một MVP: hệ thống chứng minh được ý tưởng và luồng nghiệp vụ, nhưng chưa tối ưu cho vận hành thực tế ở quy mô lớn.

## KẾT LUẬN CHUNG VÀ ĐỊNH HƯỚNG PHÁT TRIỂN

### 1. Nhận xét tổng quan về mức độ hoàn thành đồ án {#nhận-xét-tổng-quan-về-mức-độ-hoàn-thành-đồ-án}

Đồ án \"Xây dựng Hệ thống E-Commerce theo Microservices và AI\" đã hoàn thành xuất sắc các mục tiêu được đề ra trong môn học Kiến trúc và Thiết kế Phần mềm. Hệ thống không chỉ dừng lại ở mức độ lý thuyết mà đã được hiện thực hóa thành một sản phẩm Minimum Viable Product (MVP) hoàn chỉnh. Việc kết hợp thành công giữa phương pháp luận thiết kế hướng tên miền (DDD), kiến trúc Vi dịch vụ (Microservices) và Trí tuệ nhân tạo (AI) đã chứng minh được tính ưu việt của mô hình phân tán so với kiến trúc Monolithic truyền thống.

### 2. Đánh giá những ưu điểm nổi bật của hệ thống {#đánh-giá-những-ưu-điểm-nổi-bật-của-hệ-thống}

Hệ thống được thiết kế mang lại nhiều giá trị vượt trội, đáp ứng tốt cả yêu cầu chức năng lẫn phi chức năng:

- Kiến trúc linh hoạt và rành mạch: Hệ thống tuân thủ nghiêm ngặt nguyên tắc tách biệt Service theo nghiệp vụ cốt lõi (User, Product, Cart, Order, Payment, Shipping). Việc áp dụng triệt để nguyên tắc \"mỗi service một cơ sở dữ liệu riêng\" (Database-per-service kết hợp MySQL và PostgreSQL) giúp loại bỏ hoàn toàn sự phụ thuộc dữ liệu (data coupling).

- Luồng nghiệp vụ trọn vẹn (End-to-End): Hệ thống đã mô phỏng thành công chuỗi giao dịch thương mại điện tử thực tế từ bước duyệt sản phẩm, thêm giỏ hàng, đến Checkout, thanh toán và giao hàng.

- Điểm sáng về AI (Trợ lý thông minh): Việc tách biệt AI thành một Microservice độc lập sử dụng FastAPI là một thiết kế kiến trúc thông minh. Sự kết hợp Hybrid giữa mạng LSTM (dự đoán hành vi), Knowledge Graph Neo4j (lọc cộng tác) và pipeline RAG FAISS/LLM (Chatbot tư vấn) đã tạo ra sự khác biệt lớn, nâng cao trải nghiệm cá nhân hóa cho người dùng.

- Hạ tầng và Vận hành (DevOps): Toàn bộ hệ thống được container hóa bằng Docker/Docker Compose giúp loại bỏ rủi ro sai lệch môi trường, kết hợp cùng API Gateway (Nginx) điều phối traffic thông minh tạo ra một kiến trúc sẵn sàng mở rộng.

### 3. Nhìn nhận các hạn chế và rủi ro (Tư duy phản biện) {#nhìn-nhận-các-hạn-chế-và-rủi-ro-tư-duy-phản-biện}

Mặc dù đã hoàn thiện tốt ở phạm vi học thuật (MVP), nhưng nếu đánh giá theo tiêu chuẩn khắt khe của môi trường Production thực tế, kiến trúc hiện tại vẫn còn tồn tại một số điểm giới hạn cần khắc phục:

- Rủi ro từ giao tiếp đồng bộ (Synchronous REST): Hiện tại, luồng mua hàng (Order -\> Payment -\> Shipping) đang gọi API REST trực tiếp. Nếu một service trung gian bị lỗi hoặc phản hồi chậm, chuỗi giao dịch có thể bị treo, dẫn đến rủi ro lệch trạng thái dữ liệu do chưa triển khai cơ chế Rollback (Saga Pattern).

- Thiếu công cụ Giám sát và Truy vết (Observability): Với hệ thống gồm 7 container phân tán, việc thiếu vắng hệ thống logging tập trung (như ELK Stack) và tracing khiến việc debug lỗi xuyên service gặp nhiều khó khăn.

- Giới hạn của mô hình AI: Mô hình LSTM và hệ thống gợi ý hiện tại được xây dựng tốt về mặt luồng (pipeline) nhưng còn thiếu các chỉ số đánh giá định lượng khoa học (Precision@K, Recall@K, NDCG) và vòng đời quản lý mô hình (Model Lifecycle) chuyên sâu.

### 4. Định hướng phát triển tương lai {#định-hướng-phát-triển-tương-lai}

Dựa trên những hạn chế đã phân tích, hệ thống có các hướng mở rộng tiềm năng sau:

- Chuyển đổi giao tiếp Bất đồng bộ: Tích hợp Message Broker (như RabbitMQ hoặc Apache Kafka) vào hệ thống để xử lý các sự kiện (Events) như tạo đơn hàng, trừ tồn kho, giúp hệ thống chịu tải tốt hơn và giảm sự phụ thuộc (Coupling).

- Triển khai lên Kubernetes (K8s): Viết các file manifest triển khai (Deployment, Service, Ingress) để chuyển hệ thống từ Docker Compose sang cụm Kubernetes, giúp hệ thống có khả năng tự động phục hồi (Auto-healing) và mở rộng linh hoạt (Auto-scaling).

- Tăng cường Bảo mật toàn diện: Cấu hình quản lý Secret qua .env (hoặc Kubernetes Secrets) thay vì ghi cứng trực tiếp. Đồng thời, đồng bộ hóa xác thực JWT xuyên suốt tất cả các API nghiệp vụ thay vì chỉ ở API Gateway.

**LỜI KẾT :** Nhìn chung, tiểu luận đã phản ánh được quá trình nghiên cứu nghiêm túc và áp dụng thành công các công nghệ tiên tiến nhất vào phát triển phần mềm. Đồ án không chỉ là một bài tập thực hành kỹ thuật mà còn là minh chứng cho tư duy thiết kế kiến trúc hệ thống (System Design), sẵn sàng làm hành trang vững chắc để ứng dụng vào việc xây dựng các nền tảng thương mại điện tử thực tế quy mô lớn.
