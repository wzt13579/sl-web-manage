<template>
  <div class="common-login clearfix">
    <!-- 背景图 -->
    <div class="videoContainer">
      <img src="../../assets/video/fps.png" class="videoMaskImg" />
    </div>
    <!-- 顶部logo -->
    <div style="margin-top: 40px; margin-left: 79px">
      <img src="../../assets/img/logo_2.png" style="user-select: none" />
    </div>
    <!-- 登录框 -->
    <div>
      <!-- group -->
      <div class="group">
        <!-- card  -->
        <div class="card">
          <!-- 文字logo -->
          <div style="margin-top: 60px">
            <img src="../../assets/img/logo_1.png" style="user-select: none" alt="" />
            <div style="margin-top: 24px; color: #00469b; font-size: 28px">储能智慧管理云平台</div>
            <!-- <div style="margin-top: 15px; color: #00469b; font-size: 28px">WEI GUANG</div> -->
          </div>
          <t-form
            style="margin-top: 40px"
            ref="dataForm"
            :data="dataForm"
            :rules="dataRules"
            label-width="0"
            @submit="loginSubmit"
            scrollToFirstError="smooth"
            :colon="true"
            :labelWidth="0"
          >
            <t-form-item class="input" name="mobile" autocomplete="on" style="margin-bottom: 24px">
              <t-input v-model="dataForm.mobile" placeholder="请输入手机号">
                <user-icon slot="prefix-icon"></user-icon>
              </t-input>
            </t-form-item>
            <t-form-item class="input" name="password">
              <t-input v-model="dataForm.password" type="password" placeholder="请输入密码" show-password>
                <lock-on-icon slot="prefix-icon"></lock-on-icon>
              </t-input>
            </t-form-item>
            <t-checkbox class="rememberMe" v-model="dataForm.checked">记住账号</t-checkbox>
            <t-form-item>
              <t-button class="logobutton" type="submit">登录</t-button>
            </t-form-item>
          </t-form>
        </div>
      </div>
    </div>

    <!-- 底部文字 -->
    <div class="bottom-wrap">
      <t-form class="bottom"> Copyright© 2022-{{ new Date().getFullYear() }} All rights reserved. 为光能源 </t-form>
    </div>
  </div>
</template>
<script>
import Verify from './../../components/verifition/Verify';
import { UserIcon, LockOnIcon } from 'tdesign-icons-vue';
import publicFn from '@/utils/tools/common';

export default {
  name: 'login',
  components: {
    Verify,
    UserIcon,
    LockOnIcon
  },
  data() {
    return {
      dataForm: {
        mobile: '',
        password: '',
        checked: true,
        captcha: ''
      },
      dataForm2: {
        phone: '',
        verifyCode: ''
      },
      isVideoPlay: false,
      isLoading: false,
      dataRules: {
        mobile: [{ required: true, message: '请输入手机号', type: 'error', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', type: 'error', trigger: 'blur' }]
      }
    };
  },
  created() {
    let mobile = localStorage.getItem('account');
    if (mobile) {
      this.dataForm.mobile = mobile;
      this.dataForm.checked = true;
    }
  },
  methods: {
    canVideoPlayHandle() {
      this.$set(this.$data, 'isVideoPlay', true);
      this.$refs.myVideo.play();
    },

    // 点击登录按钮
    loginSubmit: publicFn.debounce(function ({ validateResult, firstError }) {
      if (validateResult) {
        this.submitLoginReq();
      } else {
        console.log(firstError);
        this.$message.warning(firstError);
      }
    }, 500),
    // 验证成功
    verifySuccess(params) {
      this.submitLoginReq();
    },
    setUserInfo() {
      if (this.dataForm.checked) {
        localStorage.setItem('account', this.dataForm.mobile);
      } else {
        localStorage.removeItem('account');
      }
    },
    // 登录接口
    submitLoginReq() {
      let _this = this;
      this.isLoading = true;

      //   console.log('this.dataForm.password:', this.dataForm.password);
      let key = 'UNXUI9un87inqm8v';
      let iv = 'SUN9782nIN1ina7t';
      let pwd = _this.Encrypt(_this.dataForm.password, key, iv);
      //   console.log('pwd:', pwd);

      this.$http({
        // url: '/web/loginAPI/login',
        // url: '/web/loginController/login',
        url: '/auth/login',
        method: 'post',
        data: {
          mobile: this.dataForm.mobile,
          //   password: this.dataForm.password
          password: pwd
          //   captcha: this.dataForm.captcha
        }
      })
        .then(({ data }) => {
          _this.$store.dispatch('user/login', data);
          sessionStorage.setItem('adminId', data.id);
          _this.$cookie.set('token', data.access_token);
          sessionStorage.setItem('token', data.access_token);
          sessionStorage.setItem('adminMobile', data.mobile);
          sessionStorage.setItem('powerStationIds', data.powerStationIds);
          _this.$router.replace({ name: 'home' });
          let encryptMobile = _this.encryptionCode(this.dataForm.mobile);
          let encryptPassword = _this.encryptionCode(this.dataForm.password);
          _this.$cookie.set('mobile', encryptMobile);
          _this.$cookie.set('password', encryptPassword);
          // 生成eventSource的uuid
          _this.userUuid();
          // 储存登录信息
          _this.setUserInfo();
          _this.isLoading = false;
        })
        .catch(e => {
          console.error(e);
          _this.isLoading = false;
        });
    },
    // 生成 uuid
    userUuid() {
      var s = [];
      var hexDigits = '0123456789abcdefghyjkmnpqrstuvwxyz';
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = '-';

      var userUuid = 'user' + '-' + s.join('');
      // 判断下是否存在 slider
      if (!sessionStorage.getItem('es-uuid')) {
        sessionStorage.setItem('es-uuid', userUuid);
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .t-input {
  background-color: #fff;
  &__inner {
    color: #000;
  }
  ::placeholder {
    color: #ccc;
  }
}

.common-login {
  width: 100%;
  height: 100%;
  position: fixed;
  background-size: 100% 100%;
  font-family: PingFangSC-Regular, PingFang SC;
  user-select: none;
}

.login-title {
  color: #fff;
  margin-top: 10px;
  text-align: left;
  font-size: 40px;
  font-weight: 400;
  letter-spacing: 2px;
  font-family: PingFangSC-Regular, PingFang SC;
  user-select: none;
}
// 记住账号
.rememberMe {
  margin: 16px auto 18px auto;
  color: #fff;
}

// 底部文字
.bottom-wrap {
  width: 100%;
  position: absolute;
  bottom: 24px;
  padding-left: 79px;
}
// 底部文字样式
.bottom {
  color: rgba(255, 255, 255, 0.9);
  user-select: none;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 1px;
}
// 背景图
.videoContainer {
  position: fixed;
  width: 100%;
  height: 100%;
  overflow: hidden;
  object-fit: cover;
  z-index: -100;
  align-items: center;
  //   overflow: scroll;
}
// 背景图片大小
.videoMaskImg {
  z-index: -100;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  user-select: none;
  //   overflow: scroll;
}
// 登录按钮
.logobutton {
  width: 100%;
  height: 48px;
  font-size: 18px;
  //   margin-top: -10px;
  border: #79a912 0px solid;
}
// 蒙版卡片内部
.card {
  //   width: 560px;
  margin-left: 60px;
  margin-right: 60px;
}
// 设置背景毛玻璃
.group {
  /*设置布局*/
  display: flex;
  -webkit-box-align: center;
  flex-direction: column;
  flex-wrap: nowrap;

  position: absolute;
  top: 7%;

  margin-left: 79px;
  margin-top: 150px;

  /*设置card的大小*/
  width: 560px;
  min-height: 500px;
  line-height: 22px;

  /*设置圆角*/
  border-radius: 5px;

  /*设置背景样式*/
  background: rgba(255, 255, 255, 0.4);

  /*让透过card的底部元素模糊化,达到毛玻璃效果*/
  backdrop-filter: blur(30px);
}
</style>
