<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item>首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索 -->
    <el-row class="searchrow">
      <el-col>
        <el-input
          @clear="loadUsers()"
          clearable
          placeholder="请输入内容"
          v-model="query"
          class="inputsearch"
        >
          <el-button @click="searchUser()" slot="append" icon="el-icon-search"></el-button>
        </el-input>
        <el-button plain type="success" @click="showAddUserDia()">添加用户</el-button>
      </el-col>
    </el-row>

    <el-table :data="userList" style="width: 100%">
      <el-table-column type="index" label="#" width="180"></el-table-column>
      <el-table-column prop="username" label="姓名" width="180"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>

      <el-table-column label="创建时间">
        <template slot-scope="scope">{{scope.row.create_time | fmtdate}}</template>
      </el-table-column>

      <el-table-column label="用户状态">
        <template slot-scope="scope">
          <el-switch
            @change="changeMgstate(scope.row)"
            v-model="scope.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>

      <el-table-column prop="address" label="操作">
        <template slot-scope="scope">
          <el-button
            @click="showEditUserDia(scope.row)"
            size="mini"
            plain
            type="primary"
            icon="el-icon-edit"
            circle
          ></el-button>
          <el-button
            size="mini"
            plain
            type="danger"
            icon="el-icon-delete"
            circle
            @click="showDeleteUserDia(scope.row.id)"
          ></el-button>
          <el-button
            @click="showSetUserRoleBox(scope.row)"
            size="mini"
            plain
            type="success"
            icon="el-icon-check"
            circle
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[ 2, 4, 8,16]"
      :page-size="2"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>

    <!-- add对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogFormVisibleAdd">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="密  码" label-width="100px">
          <el-input v-model="form.password" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="邮  箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="电  话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleAdd = false">取 消</el-button>
        <el-button type="primary" @click="AddUser() ">确 定</el-button>
      </div>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="角色分配" :visible.sync="dialogFormVisibleRole">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">{{currentUsername}}</el-form-item>
        <el-form-item label="角色" label-width="100px">
          <el-select v-model="currentRoleId">
            <el-option label="请选择" :value="-1"></el-option>
            <el-option :label="item.roleName" :value="item.id" v-for="(item,i) in roles" :key="i"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleRole = false">取 消</el-button>
        <el-button type="primary" @click="setRole()">确 定</el-button>
      </div>
    </el-dialog>

    <!-- edit对话框 -->
    <el-dialog title="编辑用户" :visible.sync="dialogFormVisibleEdit">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="100px">
          <el-input disabled v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="邮  箱" label-width="100px">
          <el-input v-model="form.email" autocomplete="off"></el-input>
        </el-form-item>

        <el-form-item label="电  话" label-width="100px">
          <el-input v-model="form.mobile" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisibleEdit = false">取 消</el-button>
        <el-button type="primary" @click="editUser()">确 定</el-button>
      </div>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      query: "",
      pagenum: 1,
      pagesize: 2,
      userList: [],
      total: -1,
      //addUser对话框可视属性
      dialogFormVisibleAdd: false,
      dialogFormVisibleEdit: false,
      dialogFormVisibleRole: false,
      form: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //分配角色
      currentRoleId: -1,
      currentUsername: "",
      //保存所有角色
      roles: [],
      currentUserId:-1
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async setRole(){
     // users/:id/role
      const res = await this.$http.put('users/'+this.currentUserId+'/role',{
        rid:this.currentRoleId
      })
      console.log(res);
      //关闭对话框
      this.dialogFormVisibleRole = false
      
    },
    //显示设置用户角色对话框
    async showSetUserRoleBox(user) {
      this.currentUsername = user.username
      this.currentUserId = user.id

      //获取所有角色名
      const res1 = await this.$http.get("roles")
      this.roles = res1.data.data

      //get 当前用户的角色id=>rid
      const res = await this.$http.get("users/" + user.id)
      this.currentRoleId = res.data.data.rid

      this.dialogFormVisibleRole = true
    },
    //change state
    async changeMgstate(user) {
      //users/:uid/state/:type
      const res = await this.$http.put(
        "users/" + user.id + "/state/" + user.mg_state
      );

      if (res.status === 200) this.$message.success(res.data.meta.msg);
      else this.$message.warning(res.data.meta.msg);
    },

    //edit user action
    async editUser() {
      //users/:id

      this.dialogFormVisibleEdit = false;

      const res = await this.$http.put("users/" + this.form.id, this.form);

      this.getUserList();
    },
    //edit user box
    showEditUserDia(user) {
      //get userInfo
      this.form = user;
      this.dialogFormVisibleEdit = true;
    },

    //delete user box |async在最近的函数位置
    showDeleteUserDia(userId) {
      this.$confirm("删除用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          //   path:users/:id
          const str = "users/" + userId;
          const res = await this.$http.delete(str);
          console.log(res);
          if (res.data.meta.status === 200) {
            this.pagenum = 1;
            this.getUserList();
            this.$message({
              type: "success",
              message: "delete success"
            });
          }
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除"
          });
        });
    },

    //显示添加用户信息框
    showAddUserDia() {
      this.form = {};
      this.dialogFormVisibleAdd = true;
    },
    //添加用户
    async AddUser() {
      this.dialogFormVisibleAdd = false;
      const res = await this.$http.post("users", this.form);
      console.log(res);
      const {
        meta: { status, msg },
        data
      } = res.data;
      if (status === 201) {
        //1提示成功
        this.$message.success(msg);
        //3更新视图
        this.getUserList();
        //4clear form
        this.form = {};
      } else {
        this.$message.warning(msg);
      }
    },
    //搜索用户
    searchUser() {
      this.getUserList();
    },
    loadUsers() {
      this.getUserList();
    },
    //   分页-begin
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pagesize = val;
      this.getUserList();
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pagenum = val;
      this.getUserList();
    },
    // 分页-end

    async getUserList() {
      const AUTH_TOKEN = localStorage.getItem("token");
      this.$http.defaults.headers.common["Authorization"] = AUTH_TOKEN;
      const str =
        "users?query=" +
        this.query +
        "&pagenum=" +
        this.pagenum +
        "&pagesize=" +
        this.pagesize;
      const res = await this.$http.get(str);
      console.log(res);
      const {
        meta: { status, msg },
        data: { users, total }
      } = res.data;
      if (status === 200) {
        this.userList = users;
        this.total = total;
        this.$message.success(msg);
      } else {
        this.$message.warning(msg);
      }
    }
  }
};
</script>

<style>
.box-card {
  height: 100%;
}
.inputsearch {
  width: 300px;
}
.searchrow {
  margin-top: 20px;
}
</style>